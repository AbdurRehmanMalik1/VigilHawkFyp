from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Any, Dict, List
from app.utils.socket_server import sio
from app.notifications.service import save_detection_alert  # your DB save function (from earlier)
from app.models import Alert
from app.camera.service import get_camera_configuration


# import your user settings service later

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

class Notification(BaseModel):
    type: str
    payload: Dict[str, Any]

@router.post("/send")
async def send_notification(msg: Notification):
    data = msg.dict()
    # 1. Save the alert/detection log to DB (example structure, adapt as needed)
    alert: Alert | None = None
    try:
        alert = await save_detection_alert(
            camera_id=data["payload"].get("camera_id"),
            frame_id=data["payload"].get("frame_id"),
            detections_data=data["payload"].get("detections", []),
            timestamp=data.get("timestamp"),  # optional timestamp key
            status="new"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save alert: {e}")

    data["violation_reasons"] = alert.violation_reasons

    data["timestamp"] = alert.timestamp.isoformat()

    await sio.emit("notification", data , namespace="/")

    return {"status": "saved and notification sent", "alert_id": str(alert.id)}


@router.get("/alerts", response_model=List[Alert])
async def get_alerts_for_camera(
    camera_id: str,
    skip: int = 0,
    limit: int = Query(10, le=100),
):
    alerts = await Alert.find(
        Alert.camera_id == PydanticObjectId(camera_id)
    ).skip(skip).limit(limit).to_list()
    
    return alerts    