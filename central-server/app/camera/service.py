from fastapi import HTTPException
from beanie import PydanticObjectId
from app.models import Camera, User
from app.camera.dto import CameraRegister, CameraOut, CameraUpdate

async def create_camera(data: CameraRegister) -> CameraOut:
    try:
        user = await User.find_one(User.id == data.registered_by)
        if not user:
            raise ValueError("User not found")
        camera = Camera(
            name=data.name,
            location=data.location,
            url=data.url,
            registered_by=PydanticObjectId(user.id),
            status='Online'
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
            registered_by=camera.registered_by,
            status=camera.status
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
            registered_by=camera.registered_by,
            status=camera.status
        )


async def start_registered_cameras(user_id: PydanticObjectId):
    cameras: list[Camera] = await Camera.find(
        Camera.registered_by == user_id
    ).to_list()



async def update_camera(user_id: PydanticObjectId, camera_id: PydanticObjectId, data: CameraUpdate) -> CameraOut:
    # Fetch the camera first, ensure it belongs to this user
    camera = await Camera.find_one(Camera.registered_by == user_id, Camera.id == camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found") 

    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(camera, key, value)
    
    await camera.save()
    
    return CameraOut(
            id=camera.id,
            name=camera.name,
            location=camera.location,
            url=camera.url,
            created_at=camera.created_at,
            registered_by= user_id,
            status=camera.status
        )
    





    