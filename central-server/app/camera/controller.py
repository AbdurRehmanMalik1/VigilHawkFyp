import asyncio
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from app.camera.dto import CameraRegister, CameraOut, CameraUpdate
from app.camera.service import create_camera, get_cameras_for_user, get_single_camera, start_registered_cameras, update_camera
import httpx

router = APIRouter()

DETECTION_BACKEND_URL = "http://localhost:8001"


@router.post("/start/{camera_id}")
async def start_camera(camera_id: str, req: Request):
    try:
        camera = await get_single_camera(req.state.user.id, PydanticObjectId(camera_id))
        if not camera:
            raise HTTPException(404, "Camera not found or not authorized")
    except Exception as e:
        raise HTTPException(500, f"Failed to retrieve camera: {e}")

    timeout = 5  # seconds
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                # Try HEAD request first
                response = await client.head(str(camera.url))
                if response.status_code != 200:
                    raise HTTPException(400, f"Camera URL not reachable (status {response.status_code})")
            except httpx.RequestError:
                # Fallback to GET if HEAD fails
                response = await client.get(str(camera.url), timeout=timeout)
                if response.status_code != 200:
                    raise HTTPException(400, f"Camera URL not reachable (status {response.status_code})")
    except HTTPException:
        # Re-raise HTTPExceptions (e.g. 400) for reachable checks
        raise
    except Exception as e:
        raise HTTPException(500, f"Error while checking camera URL reachability: {e}")

    try:
        async with httpx.AsyncClient() as client:
            print(f"{DETECTION_BACKEND_URL}/video/start_camera")
            resp = await client.post(
                f"{DETECTION_BACKEND_URL}/video/start_camera",
                params={"camera_id": camera_id, "camera_url": str(camera.url)}
            )
            if resp.status_code != 200:
                raise HTTPException(502, "Failed to start camera on detection backend")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error while calling detection backend: {e}")

    return {"status": "started"}
    

@router.get("/video_feed/{camera_id}")
async def proxy_video_feed(camera_id: str):
    url = f"{DETECTION_BACKEND_URL}/video/video_feed/{camera_id}"

    async with httpx.AsyncClient(timeout=None) as client:
        try:
            backend_response = await client.get(url, timeout=None)
            # Stream the backend MJPEG stream directly to client
            return StreamingResponse(
                backend_response.aiter_bytes(),
                media_type=backend_response.headers.get("content-type", "multipart/x-mixed-replace; boundary=frame")
            )
        except httpx.RequestError as e:
            raise HTTPException(502, detail=f"Detection backend not available: {e}")

@router.get("/{camera_id}", response_model=CameraOut, status_code=200)
async def get_camera(camera_id: str, req: Request) -> CameraOut:
    user_id = req.state.user.id
    return await get_single_camera(user_id , PydanticObjectId(camera_id))

@router.patch("/{camera_id}", response_model=CameraOut, status_code=200)
async def update_camera_controller(camera_id: str, body: CameraUpdate, req: Request) -> CameraOut:
    user_id = req.state.user.id
    return await update_camera(user_id, PydanticObjectId(camera_id), body)


@router.post("/", response_model=CameraOut, status_code=201)
async def register_camera(body: CameraRegister, req: Request)->CameraOut:
    print(req.state.user)
    body.registered_by = req.state.user.id
    return await create_camera(body)



@router.get("/" , response_model=list[CameraOut], status_code=200)
async def get_registered_cameras(req: Request)->list[CameraOut]:
    user_id = req.state.user.id
    return await get_cameras_for_user(user_id)



# @router.post("/start/{camera_id}")
# async def start_camera(camera_id: str, req: Request):
#     user_id = PydanticObjectId("691e27c49298a5ffcc00adda")#req.state.user.id
#     camera = await get_single_camera(user_id , PydanticObjectId(camera_id))
#     if camera:
#         await send_start_camera(camera_id, str(camera.url))
#         return {"status": "started"}
#     return {"details": "You start stop this camera."}


# @router.patch("/stop/{camera_id}")
# async def stop_camera(camera_id: str, req: Request):
#     user_id = PydanticObjectId("691e27c49298a5ffcc00adda")#req.state.user.id
#     camera = await get_single_camera(user_id , PydanticObjectId(camera_id))
#     if(camera):
#         await send_stop_camera(camera_id)
#         return {"status": "stopped"}
#     return {"details": "You cannot stop this camera."}


# @router.get("/stream/{camera_id}")
# async def stream(camera_id: str):
#     async def generator():
#         while True:
#             frame = latest_frames.get(camera_id)
#             print(latest_frames)
#             if frame:
#                 yield (
#                     b"--frame\r\n"
#                     b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
#                 )
#             await asyncio.sleep(0.01)

#     return StreamingResponse(generator(),media_type="multipart/x-mixed-replace; boundary=frame")



    
