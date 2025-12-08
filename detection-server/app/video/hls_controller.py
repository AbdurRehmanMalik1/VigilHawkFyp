import asyncio
import subprocess
import shutil
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict

router = APIRouter()

running_cameras: Dict[str, asyncio.Task] = {}
ffmpeg_processes: Dict[str, subprocess.Popen] = {}

HLS_ROOT = Path("/app/hls")  # folder for HLS output
HLS_ROOT.mkdir(parents=True, exist_ok=True)


async def log_ffmpeg_output(proc: subprocess.Popen, camera_id: str):
    """
    Log FFmpeg stderr asynchronously line-by-line for debugging.
    """
    loop = asyncio.get_running_loop()
    while True:
        line = await loop.run_in_executor(None, proc.stderr.readline)
        if not line:
            break
        print(f"[{camera_id}][ffmpeg] {line.decode(errors='ignore').rstrip()}")


async def run_ffmpeg_hls(camera_id: str, rtsp_url: str):
    """
    Runs FFmpeg to convert RTSP stream to HLS segments under ./hls/{camera_id}/
    """
    out_dir = HLS_ROOT / camera_id

    # Clean old HLS folder
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    ffmpeg_cmd = [
        "ffmpeg",
        "-analyzeduration", "5000000",   # 5 seconds in microseconds
        "-probesize", "5000000",         # 5 MB probe size
        "-i", rtsp_url,
        "-c:v", "copy",
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
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1  # line buffered
    )
    ffmpeg_processes[camera_id] = process

    # Start background logging of ffmpeg stderr
    log_task = asyncio.create_task(log_ffmpeg_output(process, camera_id))

    try:
        # Wait for process to complete or be cancelled
        await asyncio.get_running_loop().run_in_executor(None, process.wait)
    except asyncio.CancelledError:
        # Cancel requested: terminate ffmpeg process
        if process.poll() is None:
            process.terminate()
            await asyncio.get_running_loop().run_in_executor(None, process.wait)
        raise
    finally:
        log_task.cancel()
        ffmpeg_processes.pop(camera_id, None)


class CameraStartRequest(BaseModel):
    camera_id: str
    camera_url: str


@router.post("/start_camera")
async def start_camera(body: CameraStartRequest):
    camera_id = body.camera_id
    camera_url = body.camera_url

    if camera_id in running_cameras:
        raise HTTPException(status_code=400, detail="Camera already running")

    task = asyncio.create_task(run_ffmpeg_hls(camera_id, camera_url))
    running_cameras[camera_id] = task

    hls_url = f"/hls/{camera_id}/index.m3u8"  # Adjust path based on your mount

    return {"status": "started", "camera_id": camera_id, "camera_url": hls_url}


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
