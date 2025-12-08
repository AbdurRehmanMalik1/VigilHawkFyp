import asyncio
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
import httpx
from app.camera.dto import CameraRegister, CameraOut, CameraUpdate
from app.camera.service import create_camera, get_cameras_for_user, get_single_camera, start_registered_cameras, update_camera
from app.utils.camera_util import check_camera_url_reachable


router = APIRouter()

DETECTION_BACKEND_URL = "http://detection-server:8001"


@router.post("/start/{camera_id}")
async def start_camera(camera_id: str, req: Request):
    print(camera_id)
    try:
        camera = await get_single_camera(req.state.user.id, PydanticObjectId(camera_id))
        if not camera:
            raise HTTPException(404, "Camera not found or not authorized")
    except Exception as e:
        raise HTTPException(500, f"Failed to retrieve camera: {e}")

    data = dict()
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            print(f"{DETECTION_BACKEND_URL}/video/start_camera")
            resp = await client.post(
                f"{DETECTION_BACKEND_URL}/video/start_camera",
                params={"camera_id": camera_id, "camera_url": str(camera.url)}
            )
            # if resp.status_code != 200:
            #     raise HTTPException(502, "Failed to start camera on detection backend")
            data: dict = resp.json()
    except HTTPException as e:
        print(e)
        raise
    except Exception as e:
        raise HTTPException(500, f"Error while calling detection backend: {e}")

    return {
        "status": "started",
        "camera_id": data.get("camera_id"),
        "camera_url": f'{DETECTION_BACKEND_URL}/video/video_stream/{camera_id}'
    }
    

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



    
