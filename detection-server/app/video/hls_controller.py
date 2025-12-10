import asyncio
import subprocess
import shutil
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict
from app.utils.frame import generate_frames_for_hls, getFrameMeasurement, getVideoCapture
import cv2  # Make sure opencv-python is installed

router = APIRouter()

running_cameras: Dict[str, asyncio.Task] = {}
ffmpeg_processes: Dict[str, subprocess.Popen] = {}

HLS_ROOT = Path("/app/videos")  # folder for HLS output
HLS_ROOT.mkdir(parents=True, exist_ok=True)

async def log_ffmpeg_output(proc: subprocess.Popen, camera_id: str):
    loop = asyncio.get_running_loop()
    while True:
        line = await loop.run_in_executor(None, proc.stderr.readline)
        if not line:
            break
        print(f"[{camera_id}][ffmpeg] {line.decode(errors='ignore').rstrip()}")


async def run_ffmpeg_hls(camera_id: str, rtsp_url: str):
    out_dir = HLS_ROOT / camera_id

    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    width = 640
    height = 480
    fps = 25
    #using proxy
    # proxied_rtsp_url = f"rtsp://rtsp-server:8554/{camera_id}?source={rtsp_url}"

    cap = getVideoCapture(rtsp_url)
    width , height = getFrameMeasurement(cap)

    print(f'width = {width}    height = {height}')

    if width == 0: width = 640
    if height == 0: height = 480


    ffmpeg_cmd = [
        "ffmpeg",
        "-f", "rawvideo",
        "-pix_fmt", "bgr24",
        "-s", f"{width}x{height}",
        "-r", str(fps),
        "-i", "-",  # input from stdin
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-tune", "zerolatency",
        "-c:a", "aac",
        "-f", "hls",
        "-hls_time", "2",
        "-hls_list_size", "5",
        "-hls_flags", "delete_segments",
        "-hls_allow_cache", "0",
        str(out_dir / "index.m3u8")
    ]

    print(out_dir)
    print(f"[{camera_id}] Running FFmpeg: {' '.join(ffmpeg_cmd)}")

    process = subprocess.Popen(
        ffmpeg_cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        bufsize=0  # unbuffered for stdin pipe
    )
    ffmpeg_processes[camera_id] = process

    log_task = asyncio.create_task(log_ffmpeg_output(process, camera_id))

    loop = asyncio.get_running_loop()

    try:
        # Run frame generator and pipe frames into ffmpeg stdin asynchronously
        for frame_bytes in generate_frames_for_hls(rtsp_url, width, height, cap):
            if process.poll() is not None:
                print(f"[{camera_id}] FFmpeg process ended unexpectedly")
                break

            # Write raw frame bytes to ffmpeg stdin
            process.stdin.write(frame_bytes)

        # Close stdin to signal end of input
        process.stdin.close()

        # Wait for FFmpeg to finish processing
        await loop.run_in_executor(None, process.wait)

    except asyncio.CancelledError:
        if process.poll() is None:
            process.terminate()
            await loop.run_in_executor(None, process.wait)
        raise
    finally:
        log_task.cancel()
        ffmpeg_processes.pop(camera_id, None)


async def run_ffmpeg_hls_direct(camera_id: str, rtsp_url: str):
    out_dir = HLS_ROOT / camera_id

    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    ffmpeg_cmd = [
        "ffmpeg",
        "-rtsp_transport", "tcp",
        "-i", rtsp_url,
        "-c:v", "copy",        # direct video copy (no re-encoding)
        "-c:a", "aac",
        "-f", "hls",
        "-hls_time", "2",
        "-hls_list_size", "5",
        "-hls_flags", "delete_segments",
        "-hls_allow_cache", "0",
        str(out_dir / "index.m3u8")
    ]

    print(f"[{camera_id}] Running DIRECT FFmpeg: {' '.join(ffmpeg_cmd)}")

    process = subprocess.Popen(
        ffmpeg_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    ffmpeg_processes[camera_id] = process

    log_task = asyncio.create_task(log_ffmpeg_output(process, camera_id))

    loop = asyncio.get_running_loop()

    try:
        await loop.run_in_executor(None, process.wait)
    except asyncio.CancelledError:
        if process.poll() is None:
            process.terminate()
            await loop.run_in_executor(None, process.wait)
        raise
    finally:
        log_task.cancel()
        ffmpeg_processes.pop(camera_id, None)



class CameraStartRequest(BaseModel):
    camera_id: str
    camera_url: str

NGINX_PUBLIC_SERVER_URL = 'http://localhost:8083'

@router.post("/start_camera")
async def start_camera(body: CameraStartRequest):
    camera_id = body.camera_id
    camera_url = body.camera_url

    if camera_id in running_cameras:
        raise HTTPException(status_code=400, detail="Camera already running")

    task = asyncio.create_task(run_ffmpeg_hls(camera_id, camera_url))
    running_cameras[camera_id] = task

    hls_url = f"{NGINX_PUBLIC_SERVER_URL}/videos/{camera_id}/index.m3u8"

    return {"status": "started", "camera_id": camera_id, "camera_url": hls_url}


@router.post("/start_camera_direct")
async def start_camera_direct(body: CameraStartRequest):
    camera_id = body.camera_id
    camera_url = body.camera_url

    if camera_id in running_cameras:
        raise HTTPException(status_code=400, detail="Camera already running")

    task = asyncio.create_task(run_ffmpeg_hls_direct(camera_id, camera_url))
    running_cameras[camera_id] = task

    hls_url = f"{NGINX_PUBLIC_SERVER_URL}/videos/{camera_id}/index.m3u8"

    return {"status": "started_direct", "camera_id": camera_id, "camera_url": hls_url}

@router.post("/stop_camera")
async def stop_camera(camera_id: str = Query(..., description="Camera ID to stop")):
    if camera_id not in running_cameras:
        raise HTTPException(status_code=404, detail="Camera not running")

    running_cameras[camera_id].cancel()
    try:
        await running_cameras[camera_id]
    except asyncio.CancelledError:
        pass

    del running_cameras[camera_id]

    if camera_id in ffmpeg_processes:
        proc = ffmpeg_processes[camera_id]
        if proc.poll() is None:
            proc.terminate()
        ffmpeg_processes.pop(camera_id, None)

    out_dir = HLS_ROOT / camera_id
    if out_dir.exists():
        shutil.rmtree(out_dir)

    return {"status": "stopped", "camera_id": camera_id}
