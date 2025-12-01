from fastapi import HTTPException
from beanie import PydanticObjectId
from app.models import Camera, User
from app.camera.dto import CameraRegister, CameraOut

async def create_camera(data: CameraRegister) -> CameraOut:
    try:
        user = await User.find_one(User.id == data.registered_by)
        if not user:
            raise ValueError("User not found")
        camera = Camera(
            name=data.name,
            location=data.location,
            url=data.url,
            registered_by=PydanticObjectId(user.id)
        )
        await camera.insert()

        return CameraOut(
            id=camera.id,
            name=camera.name,
            location=camera.location,
            url=camera.url,
            created_at=camera.created_at,
            registered_by= user.id, # type: ignore
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    

async def get_cameras_for_user(user_id: PydanticObjectId) -> list[CameraOut]:
    cameras = await Camera.find(Camera.registered_by == user_id).to_list()
    result: list[CameraOut] = []
    for camera in cameras:
        result.append(CameraOut(
            id=camera.id,
            name=camera.name,
            location=camera.location,
            url=camera.url,
            created_at=camera.created_at,
            registered_by=camera.registered_by
        ))

    return result

async def get_single_camera(user_id: PydanticObjectId, camera_id: PydanticObjectId) -> CameraOut:
    camera = await Camera.find_one(Camera.registered_by == user_id, Camera.id == camera_id)

    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found for user.")

    return CameraOut(
            id=camera.id,
            name=camera.name,
            location=camera.location,
            url=camera.url,
            created_at=camera.created_at,
            registered_by=camera.registered_by
        )

    




    