import asyncio
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
import httpx
from app.camera.dto import CameraConfigUpdate, CameraRegister, CameraOut, CameraUpdate
from app.camera.service import (
    create_camera,
    get_camera_configuration,
    get_cameras_for_user,
    get_single_camera,
    start_camera_backend,
    start_camera_direct_backend,
    stop_camera_backend,
    update_camera,
    delete_camera,
    delete_all_cameras_for_user,
    update_camera_configuration,
)
from app.models import Camera, CameraConfiguration
from app.logger.service import log_event

router = APIRouter()

# DETECTION_BACKEND_URL = "http://detection-server:8001"
DETECTION_BACKEND_URL = "http://detection-server:8001"

REAL_DETECTION_BACKEND_URL = "http://localhost:8001"


@router.post("/start/{camera_id}")
async def start_camera(camera_id: str, req: Request):
    # Get camera for this user
    camera = await Camera.find_one(
        {"_id": PydanticObjectId(camera_id), "registered_by": req.state.user.id}
    )
    if not camera:
        await log_event(
            event_type="Camera Start",
            category="System",
            source="Camera",
            description=f"Unauthorized or invalid camera start attempt (ID: {camera_id})",
            status="Failed",
            user_id=req.state.user.id,
        )
        raise HTTPException(404, "Camera not found or not authorized")

    await log_event(
        event_type="Camera Start",
        category="System",
        source=f"Camera {camera.name}",
        description=f"Camera started successfully",
        status="Successful",
        user_id=req.state.user.id,
        reference_id=camera.id,
    )

    return await start_camera_backend(camera)


@router.post("/start_direct/{camera_id}")
async def start_camera_direct(camera_id: str, req: Request):
    # Get camera for this user
    camera = await Camera.find_one(
        {"_id": PydanticObjectId(camera_id), "registered_by": req.state.user.id}
    )
    if not camera:
        await log_event(
            event_type="Camera Start Direct",
            category="System",
            source="Camera",
            description=f"Failed direct start attempt (ID: {camera_id})",
            status="Failed",
            user_id=req.state.user.id,
        )
        raise HTTPException(404, "Camera not found or not authorized")

    await log_event(
        event_type="Camera Start Direct",
        category="System",
        source=f"Camera {camera.name}",
        description="Camera started in direct mode",
        status="Successful",
        user_id=req.state.user.id,
        reference_id=camera.id,
    )

    # Call the direct backend service
    return await start_camera_direct_backend(camera)


@router.post("/stop/{camera_id}")
async def stop_camera(camera_id: str, req: Request):
    try:
        camera = await get_single_camera(req.state.user.id, PydanticObjectId(camera_id))
        if not camera:
            raise HTTPException(404, "Camera not found or not authorized")

        data = await stop_camera_backend(camera)

        await log_event(
            event_type="Camera Stop",
            category="System",
            source=f"Camera {camera.name}",
            description="Camera stopped successfully",
            status="Successful",
            user_id=req.state.user.id,
            reference_id=camera.id,
        )
        return {
            "status": data.get("status"),
            "camera_id": camera_id,
        }
    except Exception as e:
        await log_event(
            event_type="Camera Stop",
            category="System",
            source="Camera",
            description=f"Failed to stop camera: {str(e)}",
            status="Failed",
            user_id=req.state.user.id,
            reference_id=PydanticObjectId(camera_id),
        )
        raise HTTPException(500, f"Failed to stop camera: {e}")


@router.get("/video_feed/{camera_id}")
async def proxy_video_feed(camera_id: str):
    url = f"{DETECTION_BACKEND_URL}/video/video_feed/{camera_id}"

    async with httpx.AsyncClient(timeout=None) as client:
        try:
            backend_response = await client.get(url, timeout=None)
            return StreamingResponse(
                backend_response.aiter_raw(),  # use aiter_raw for streaming bytes
                media_type=backend_response.headers.get("content-type"),
            )
        except httpx.RequestError as e:
            raise HTTPException(502, detail=f"Detection backend not available: {e}")


@router.get("/{camera_id}", response_model=CameraOut, status_code=200)
async def get_camera(camera_id: str, req: Request) -> CameraOut:
    user_id = req.state.user.id
    return await get_single_camera(user_id, PydanticObjectId(camera_id))


@router.patch("/{camera_id}", response_model=CameraOut, status_code=200)
async def update_camera_controller(
    camera_id: str, body: CameraUpdate, req: Request
) -> CameraOut:
    user_id = req.state.user.id
    result = await update_camera(user_id, PydanticObjectId(camera_id), body)

    # Log the update event
    await log_event(
        event_type="Camera Update",
        category="System",
        source=f"Camera {result.id}",
        description="Camera updated successfully",
        status="Successful",
        user_id=user_id,
        reference_id=PydanticObjectId(camera_id),
    )

    return result


@router.delete("/{camera_id}", status_code=200)
async def delete_single_camera(camera_id: str, req: Request):
    user_id = req.state.user.id

    camera = await get_single_camera(user_id, PydanticObjectId(camera_id))
    if not camera:
        raise HTTPException(404, "Camera not found or not authorized")

    try:
        await stop_camera_backend(camera)
        # Log successful stop
        await log_event(
            event_type="Camera Stop",
            category="System",
            source=f"Camera {camera.name}",
            description="Camera stopped successfully",
            status="Successful",
            user_id=user_id,
            reference_id=camera.id,
        )
    except HTTPException as e:
        # Log failure to stop camera
        await log_event(
            event_type="Camera Stop",
            category="System",
            source="Camera",
            description=f"Failed to stop camera: {str(e)}",
            status="Failed",
            user_id=user_id,
            reference_id=PydanticObjectId(camera_id),
        )
        if "not running" not in str(e.detail).lower():
            raise

    success = await delete_camera(user_id, PydanticObjectId(camera_id))
    if not success:
        raise HTTPException(500, "Failed to delete camera")

    return {"status": "deleted", "camera_id": camera_id}


@router.post("/", response_model=CameraOut, status_code=201)
async def register_camera(body: CameraRegister, req: Request) -> CameraOut:
    body.registered_by = req.state.user.id
    camera = await create_camera(body)

    # Log the camera registration
    await log_event(
        event_type="Camera Registration",
        category="System",
        source=f"Camera {camera.id}",
        description="Camera registered successfully",
        status="Successful",
        user_id=req.state.user.id,
        reference_id=camera.id,
    )

    return camera


@router.get("/", response_model=list[CameraOut], status_code=200)
async def get_registered_cameras(req: Request) -> list[CameraOut]:
    user_id = req.state.user.id
    return await get_cameras_for_user(user_id)


@router.patch("/config/{camera_id}", response_model=CameraConfiguration)
async def update_camera_config(
    camera_id: PydanticObjectId, body: CameraConfigUpdate, req: Request
):
    """
    Update the configuration of a camera.
    Only fields provided in the request will be updated.
    """
    # Optional: ensure user is authorized
    if not hasattr(req.state, "user") or not req.state.user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Call service function to update the configuration
    updated_config = await update_camera_configuration(camera_id, body)

    # Log the configuration update
    await log_event(
        event_type="Camera Configuration Update",
        category="System",
        source=f"Camera {camera_id}",
        description="Camera configuration updated successfully",
        status="Successful",
        user_id=req.state.user.id,
        reference_id=camera_id,
    )

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

    # Log the deletion of all cameras
    await log_event(
        event_type="Delete All Cameras",
        category="System",
        source="User Camera Collection",
        description=f"Deleted all cameras for user. Count: {deleted_count}",
        status="Successful",
        user_id=user_id,
        reference_id=None,  # No single camera, so None is appropriate
    )

    return {"status": "all_cameras_deleted", "deleted_count": deleted_count}
