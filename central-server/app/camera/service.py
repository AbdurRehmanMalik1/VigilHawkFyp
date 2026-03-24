from datetime import datetime

from fastapi import HTTPException
from beanie import PydanticObjectId
import httpx
from pydantic import AnyUrl
from app.models import Camera, CameraConfiguration, User
from app.camera.dto import CameraConfigCreate, CameraConfigUpdate, CameraRegister, CameraOut, CameraUpdate
from app.logger.service import log_event

DETECTION_BACKEND_URL = "http://detection-server:8001"

REAL_DETECTION_BACKEND_URL = "http://localhost:8001"


from pydantic import AnyUrl

async def create_camera(data: CameraRegister) -> CameraOut:
    # Find the user
    user = await User.find_one(User.id == data.registered_by)
    if not user:
        raise ValueError("User not found")

    # Initially save the camera with its original URL
    camera = Camera(
        name=data.name,
        location=data.location,
        url=data.url,  # save original URL first
        registered_by=PydanticObjectId(user.id),
        status="Offline",
        rtspUrl=str(data.url)
    )
    await camera.insert()  # this generates camera.id
    assert camera.id is not None
    assert user.id is not None

    # If the camera is RTSP, update the URL to the HLS direct form
    is_rtsp = str(camera.url).lower().startswith("rtsp://")
    if is_rtsp:
        hls_url = AnyUrl.build(
            scheme="http",
            host="localhost",
            port=8083,
            path=f"videos_direct/{camera.id}/index.m3u8"  # remove the leading slash
        )
        camera.url = hls_url
        await camera.save()  # update the URL in the DB

    # Insert default configuration
    try:
        default_config = CameraConfiguration(
            camera_id=camera.id,
            ai_detection=True,
            persons_allowed=1,
            alert_priority="Medium",
            dashboard_alerts=True,
            email_alerts=False,
            allowed_time_range_from=None,
            allowed_time_range_to=None
        )
        await default_config.insert()
    except Exception as e:
        await log_event(
            event_type="Camera Registration",
            category="System",
            source=f"Camera {camera.name}",
            status="Failed",
            user_id=data.registered_by,
            reference_id=camera.id,
        )
        raise

    # Build output
    cameraout = CameraOut(
        id=camera.id,
        name=camera.name,
        location=camera.location,
        url=camera.url,
        created_at=camera.created_at,
        registered_by=user.id,
        status="Offline"
    )
    return cameraout
    

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
            status=camera.status,
            rtspUrl= camera.rtspUrl
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
            status=camera.status,
            rtspUrl= camera.rtspUrl
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
    

async def start_camera_backend(camera: Camera) -> dict:
    """
    Start a camera stream via the detection backend.
    Sets the camera status to 'Online' in the database.
    Returns a dict containing camera_url, camera_id, and status.
    """
    data: dict = {}

    try:
        if "rtsp" in camera.url.encoded_string():
            endpoint = f"{DETECTION_BACKEND_URL}/hls_stream/start_camera"
            payload = {"camera_id": str(camera.id), "camera_url": str(camera.url)}
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(endpoint, json=payload)
        else:
            endpoint = f"{DETECTION_BACKEND_URL}/video/start_camera"
            params = {"camera_id": str(camera.id), "camera_url": str(camera.url)}
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(endpoint, params=params)
        data = resp.json()
        resp.raise_for_status()
        
        # Update camera status in DB
        camera.status = "Online"
        await camera.save()

        # Construct return URL
        camera_url = (
            data.get("camera_url")
            if "rtsp" in camera.url.encoded_string()
            else f"{REAL_DETECTION_BACKEND_URL}/video/video_feed/{camera.id}"
        )

        return {
            "camera_id": str(camera.id),
            "camera_url": camera_url,
            "status": "Online"
        }

    except httpx.HTTPStatusError as e:
        await log_event(
            event_type="Camera Stop",
            category="System",
            source=f"Camera {camera.name}",
            description=f"Failed to stop camera: {e.response.text}",
            status="Failed",
            user_id=None,  # or current user ID
            reference_id=camera.id,
        )
        raise HTTPException(status_code=e.response.status_code, detail=f"Backend error: {e}")
    except Exception as e:
        await log_event(
            event_type="Camera Stop",
            category="System",
            source=f"Camera {camera.name}",
            description=f"Error while calling detection backend",
            status="Failed",
            user_id=None,
            reference_id=camera.id,
        )
        raise HTTPException(status_code=500, detail=f"Error while starting camera: {e}")

async def start_camera_direct_backend(camera:Camera) -> dict:
    """
    Start a camera stream via the detection backend using the DIRECT FFmpeg HLS route.
    Sets the camera status to 'Online' in the database.
    Returns a dict containing camera_url, camera_id, and status.
    """
    try:
        # Only use the direct HLS endpoint for RTSP streams
        if  camera.rtspUrl and "rtsp" in camera.rtspUrl:
            print('here')
            endpoint = f"{DETECTION_BACKEND_URL}/hls_stream/start_camera_direct"
            payload = {"camera_id": str(camera.id), "camera_url": camera.rtspUrl}
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(endpoint, json=payload)
                data = resp.json()

            # Update camera status in DB
            camera.status = "Online"
            await camera.save()

            camera_url = data.get("camera_url")  # URL returned by backend

            return {
                "camera_id": str(camera.id),
                "camera_url": camera_url,
                "status": "Online",
            }
        else:
            # Non-RTSP streams don’t use direct HLS
            raise HTTPException(status_code=400, detail="Direct HLS only supports RTSP streams")

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Backend error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error while starting camera: {e}")

async def stop_camera_backend(camera: CameraOut) -> dict:
    """
    Stop a camera stream via the detection backend.
    Handles both normal and RTSP/HLS streams.
    Sets camera.status to "Offline" after stopping.
    Returns the backend response as a dictionary.
    """
    try:
        # Determine backend endpoint
        if 'rtsp' not in camera.url.encoded_string():
            endpoint = f"{DETECTION_BACKEND_URL}/video/stop_camera"
        else:
            endpoint = f"{DETECTION_BACKEND_URL}/hls_stream/stop_camera"

        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                endpoint,
                params={"camera_id": str(camera.id)}
            )
            resp.raise_for_status()
            resp_data = resp.json()
            
        camera_doc = await Camera.find_one(Camera.id == camera.id)
        if camera_doc:
            camera_doc.status = "Offline"
            await camera_doc.save()
        return resp_data

    except httpx.HTTPStatusError as e:
        await log_event(
            event_type="Camera Stop",
            category="System",
            source=f"Camera {camera.name}",
            description=f"Failed to stop camera: {e.response.text}",
            status="Failed",
            user_id=None,  # or current user ID
            reference_id=camera.id,
        )
        raise HTTPException(status_code=e.response.status_code, detail=f"Backend error: {e.response.text}")
    except Exception as e:
        await log_event(
            event_type="Camera Stop",
            category="System",
            source=f"Camera {camera.name}",
            description=f"Error while calling detection backend",
            status="Failed",
            user_id=None,
            reference_id=camera.id,
        )
        raise HTTPException(status_code=500, detail=f"Error while calling detection backend: {e}")




async def delete_camera(user_id, camera_id: PydanticObjectId) -> bool:
    camera = await Camera.get(camera_id)

    if not camera or camera.registered_by != user_id:
        return False

    await camera.delete()
    return True

async def delete_all_cameras_for_user(user_id) -> int:
    result = await Camera.find(Camera.registered_by == user_id).delete()
    return 0


    
async def configure_camera_first_time(config_data: CameraConfigCreate) -> CameraConfiguration:
    """
    Create and save a CameraConfiguration for a given camera.
    """
    # Check if the camera exists
    camera = await Camera.get(config_data.camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    # Create the configuration
    camera_config = CameraConfiguration(
        camera_id=config_data.camera_id,
        ai_detection=config_data.ai_detection,
        persons_allowed=config_data.persons_allowed,
        alert_priority=config_data.alert_priority,
        dashboard_alerts=config_data.dashboard_alerts,
        email_alerts=config_data.email_alerts,
        allowed_time_range_from=config_data.allowed_time_range_from,
        allowed_time_range_to=config_data.allowed_time_range_to,
    )

    # Insert into DB
    await camera_config.insert()
    return camera_config


async def update_camera_configuration(camera_id: PydanticObjectId, update_data: CameraConfigUpdate) -> CameraConfiguration:
    """
    Update the configuration of a camera.
    Only the fields provided in update_data will be updated.
    """
    # Find the configuration
    config = await CameraConfiguration.find_one(CameraConfiguration.camera_id == camera_id)
    if not config:
        raise HTTPException(status_code=404, detail="Camera configuration not found")

    # Update fields dynamically
    update_dict = update_data.dict(exclude_unset=True)

    for key, value in update_dict.items():
        # Save time ranges as strings directly
        setattr(config, key, value)

    # Save changes
    await config.save()
    return config

async def get_camera_configuration(camera_id: PydanticObjectId) -> CameraConfiguration:
    """
    Fetch a camera configuration by camera_id.
    """
    config = await CameraConfiguration.find_one(CameraConfiguration.camera_id == camera_id)
    if not config:
        raise HTTPException(status_code=404, detail="Camera configuration not found")
    return config


