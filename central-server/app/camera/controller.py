import asyncio
from beanie import PydanticObjectId
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from app.camera.dto import CameraRegister, CameraOut
from app.camera.service import create_camera, get_cameras_for_user, get_single_camera

router = APIRouter()

@router.post("/", response_model=CameraOut, status_code=201)
async def register_camera(body: CameraRegister, req: Request)->CameraOut:
    body.registered_by = req.state.user.id
    return await create_camera(body)

@router.get("/" , response_model=list[CameraOut], status_code=200)
async def get_registered_cameras(req: Request)->list[CameraOut]:
    user_id = req.state.user.id
    return await get_cameras_for_user(user_id)


@router.get("/{camera_id}", response_model=CameraOut, status_code=200)
async def get_camera(camera_id: str, req: Request) -> CameraOut:
    user_id = req.state.user.id
    return await get_single_camera(user_id , PydanticObjectId(camera_id))


@router.post("/start/{camera_id}")
async def start_camera(camera_id: str, req: Request):
    user_id = PydanticObjectId("691e27c49298a5ffcc00adda")#req.state.user.id
    camera = await get_single_camera(user_id , PydanticObjectId(camera_id))
    if camera:
        await send_start_camera(camera_id, str(camera.url))
        return {"status": "started"}
    return {"details": "You start stop this camera."}


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



    
