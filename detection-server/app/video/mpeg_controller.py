import asyncio
import time
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.utils.frame import generate_frames

router = APIRouter()

running_cameras: dict[str, asyncio.Task] = {}
latest_frames: dict[str, bytes] = {} 

async def camera_task(camera_id: str, camera_url: str):
    #print(f"[START] Camera {camera_id}")

    try:
        for frame_bytes in generate_frames(camera_url, camera_id=camera_id):
            latest_frames[camera_id] = frame_bytes
            await asyncio.sleep(0)  # yield to event loop
    except asyncio.CancelledError:
        print(f"[STOP] Camera {camera_id} cancelled")
    except Exception as e:
        print(f"[ERROR] Camera {camera_id} crashed: {e}")
    finally:
        latest_frames.pop(camera_id, None)

    #print(f"[END] Camera {camera_id}")


async def mjpeg_stream(camera_id: str):
    if camera_id not in latest_frames:
        # Wait until the first frame arrives or camera starts
        while camera_id not in latest_frames:
            await asyncio.sleep(0.05)

    #print(f'is camera in latest_Frames {camera_id in latest_frames}' )
    while True:
        if camera_id in latest_frames:
            frame = latest_frames[camera_id]
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
            )
        await asyncio.sleep(0.03)  # 30 FPS cap

@router.get("/video_feed/{camera_id}")
async def video_feed(camera_id: str):
    if camera_id not in running_cameras:
        raise HTTPException(404, "Camera not running")
    
    return StreamingResponse(   
        mjpeg_stream(camera_id),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@router.get("/direct_stream")
async def direct_stream(camera_url: str):
    """
    Directly streams frames from the provided camera_url without starting a background task.
    """

    async def stream():
        #print(f"[DIRECT STREAM] {camera_url}")

        try:
            for frame_bytes in generate_frames(camera_url, camera_id=''):
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
                )
                await asyncio.sleep(0)  # allow event loop switching
        except Exception as e:
            print(f"[ERROR] direct stream crashed: {e}")
            return

    return StreamingResponse(
        stream(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@router.post("/start_camera")
async def start_camera(camera_id: str, camera_url: str):
    #print('start camera called')
    if camera_id in running_cameras:
        raise HTTPException(400, "Camera already running")

    task = asyncio.create_task(camera_task(camera_id, camera_url))
    running_cameras[camera_id] = task

    return {"status": "started", "camera_id": camera_id}


@router.post("/stop_camera")
async def stop_camera(camera_id: str):
    task = running_cameras.get(camera_id)
    if not task:
        raise HTTPException(404, f"Camera {camera_id} is not running")

    task.cancel()
    del running_cameras[camera_id]

    return {"status": "stopped", "camera_id": camera_id}
