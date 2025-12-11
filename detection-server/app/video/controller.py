import asyncio
import subprocess
import cv2
from fastapi import APIRouter, HTTPException
from app.utils.frame import getVideoCapture, getFrameMeasurement, generate_frames_rtsp

router = APIRouter()

running_cameras: dict[str, asyncio.Task] = {}
ffmpeg_processes: dict[str, subprocess.Popen] = {}


async def loop_exce_function(loop, write_func, data, flush_func):
    await loop.run_in_executor(None, write_func, data)
    await loop.run_in_executor(None, flush_func)


async def camera_task(camera_id: str, camera_url: str, rtsp_out_url: str):
    # OPTIONAL: You can get width, height, fps dynamically inside generate_frames or here with OpenCV
    width = 640
    height = 480
    fps = 25

    cap = getVideoCapture(camera_url)
    width , height = getFrameMeasurement(cap)

    if width == 0: width = 640
    if height == 0: height = 480
   
    ffmpeg_cmd = [
        "ffmpeg",
        "-y",
        "-f", "rawvideo",
        "-pix_fmt", "bgr24",
        "-s", f"{width}x{height}",
        "-r", str(fps),
        "-i", "-",
        "-vf", "format=yuv420p",       # Add this line to convert pixel format
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-tune", "zerolatency",
        "-f", "rtsp",
        "-rtsp_transport", "udp",
        rtsp_out_url,
    ]

    #print(f"[{camera_id}] Starting FFmpeg with command: {' '.join(ffmpeg_cmd)}")
    ffmpeg_process = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)
    ffmpeg_processes[camera_id] = ffmpeg_process
    
    loop = asyncio.get_running_loop()
    
    try:
        frame_count = 0
        for frame in generate_frames_rtsp(camera_url , width , height, cap, camera_id):
            # Write frame to ffmpeg stdin using run_in_executor to avoid blocking
            try:
                await loop_exce_function(loop, ffmpeg_process.stdin.write, frame, ffmpeg_process.stdin.flush) # type: ignore
            except BrokenPipeError:
                #print(f"[{camera_id}] Broken pipe, FFmpeg process might have exited")
                break
            except Exception as e:
                #print(f"[{camera_id}] Error writing to FFmpeg stdin: {e}")
                break

            frame_count += 1
            await asyncio.sleep(0)  # yield control to event loop
            #print(f"[{camera_id}] Published {frame_count} frames")
    except asyncio.CancelledError:
        pass
        #print(f"Camera task {camera_id} cancelled")
    finally:
        if ffmpeg_process.stdin:
            ffmpeg_process.stdin.close()
        ffmpeg_process.wait()
        ffmpeg_processes.pop(camera_id, None)
        #print(f"[{camera_id}] FFmpeg process ended")


@router.post("/start_camera")
async def start_camera(camera_id: str, camera_url: str):
    if camera_id in running_cameras:
        raise HTTPException(400, "Camera already running")

    # This is the RTSP URL where ffmpeg will push the stream to your RTSP server.
    # Example: rtsp://rtsp-server:8554/{camera_id}
    rtsp_out_url = f"rtsp://rtsp-server:8554/{camera_id}"

    task = asyncio.create_task(camera_task(camera_id, camera_url, rtsp_out_url))
    running_cameras[camera_id] = task

    return {
        "status": "started", 
        "camera_id": camera_id, 
        "rtsp_out_url": rtsp_out_url.replace('rtsp-server' ,'localhost')
    }


@router.post("/stop_camera")
async def stop_camera(camera_id: str):
    if camera_id not in running_cameras:
        raise HTTPException(404, "Camera not running")

    running_cameras[camera_id].cancel()
    await running_cameras[camera_id]
    del running_cameras[camera_id]

    # Also terminate ffmpeg if running
    if camera_id in ffmpeg_processes:
        proc = ffmpeg_processes[camera_id]
        proc.terminate()
        ffmpeg_processes.pop(camera_id, None)

    return {"status": "stopped", "camera_id": camera_id}
