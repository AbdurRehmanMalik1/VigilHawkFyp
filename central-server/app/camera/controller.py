import asyncio
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
import httpx
from app.camera.dto import CameraConfigUpdate, CameraRegister, CameraOut, CameraUpdate
from app.camera.service import create_camera, get_camera_configuration, get_cameras_for_user, get_single_camera, start_camera_backend, start_camera_direct_backend, stop_camera_backend, update_camera, delete_camera, delete_all_cameras_for_user, update_camera_configuration
from app.models import Camera, CameraConfiguration

router = APIRouter()

#DETECTION_BACKEND_URL = "http://detection-server:8001"
DETECTION_BACKEND_URL = "http://detection-server:8001"

REAL_DETECTION_BACKEND_URL = "http://localhost:8001"


@router.post("/start/{camera_id}")
async def start_camera(camera_id: str, req: Request):
    # Get camera for this user
    camera = await Camera.find_one({"_id": PydanticObjectId(camera_id), "registered_by": req.state.user.id})
    if not camera:
        raise HTTPException(404, "Camera not found or not authorized")

    return await start_camera_backend(camera)

@router.post("/start_direct/{camera_id}")
async def start_camera_direct(camera_id: str, req: Request):
    # Get camera for this user
    camera = await Camera.find_one({"_id": PydanticObjectId(camera_id), "registered_by": req.state.user.id})
    if not camera:
        raise HTTPException(404, "Camera not found or not authorized")

    # Call the direct backend service
    return await start_camera_direct_backend(camera)

@router.post("/stop/{camera_id}")
async def stop_camera(camera_id: str, req: Request):
    try:
        camera = await get_single_camera(req.state.user.id, PydanticObjectId(camera_id))
        if not camera:
            raise HTTPException(404, "Camera not found or not authorized")
        
        data = await stop_camera_backend(camera)

        return {
            "status": data.get('status'),
            "camera_id": camera_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to stop camera: {e}")
    

    

@router.get("/video_feed/{camera_id}")
async def proxy_video_feed(camera_id: str):
    url = f"{DETECTION_BACKEND_URL}/video/video_feed/{camera_id}"

    async with httpx.AsyncClient(timeout=None) as client:
        try:
            backend_response = await client.get(url, timeout=None)
            return StreamingResponse(
                backend_response.aiter_raw(),  # use aiter_raw for streaming bytes
                media_type=backend_response.headers.get("content-type")
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

@router.delete("/{camera_id}", status_code=200)
async def delete_single_camera(camera_id: str, req: Request):
    user_id = req.state.user.id

    camera = await get_single_camera(user_id, PydanticObjectId(camera_id))
    if not camera:
        raise HTTPException(404, "Camera not found or not authorized")
    try:
        await stop_camera_backend(camera)
    except HTTPException as e:
        if "not running" not in str(e.detail).lower():
            raise

    success = await delete_camera(user_id, PydanticObjectId(camera_id))
    if not success:
        raise HTTPException(500, "Failed to delete camera")

    return {"status": "deleted", "camera_id": camera_id}



@router.post("/", response_model=CameraOut, status_code=201)
async def register_camera(body: CameraRegister, req: Request)->CameraOut:
    #print(req.state.user)
    body.registered_by = req.state.user.id
    print(body)
    return await create_camera(body)




@router.get("/" , response_model=list[CameraOut], status_code=200)
async def get_registered_cameras(req: Request)->list[CameraOut]:
    user_id = req.state.user.id
    return await get_cameras_for_user(user_id)


@router.patch("/config/{camera_id}", response_model=CameraConfiguration)
async def update_camera_config(camera_id: PydanticObjectId, body: CameraConfigUpdate, req: Request):
    """
    Update the configuration of a camera.
    Only fields provided in the request will be updated.
    """
    # Optional: ensure user is authorized
    if not hasattr(req.state, "user") or not req.state.user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Call service function to update the configuration
    updated_config = await update_camera_configuration(camera_id, body)
    return updated_config

@router.get("/config/{camera_id}", response_model=CameraConfiguration)
async def fetch_camera_config(camera_id: PydanticObjectId, req: Request):
    """
    Get the configuration for a specific camera by its ID.
    """
    # Optional: check for authenticated user
    if not hasattr(req.state, "user") or not req.state.user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return await get_camera_configuration(camera_id)


@router.delete("/", status_code=200)
async def delete_all_cameras(req: Request):
    user_id = req.state.user.id

    deleted_count = await delete_all_cameras_for_user(user_id)

    return {
        "status": "all_cameras_deleted",
        "deleted_count": deleted_count
    }
    

























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
