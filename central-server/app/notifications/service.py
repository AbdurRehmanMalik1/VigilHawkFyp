import traceback
from typing import Any, List, Optional
from beanie import PydanticObjectId
from datetime import datetime
from app.models import Detection, Alert

# The save function
async def save_detection_alert(
    camera_id: str,
    frame_id: Any,
    detections_data: List[dict],
    timestamp: Optional[str] = None,
    status: str = "new",
) -> Alert:
    try:
        if timestamp:
            try:
                timestamp_dt = datetime.fromisoformat(timestamp)
            except Exception:
                timestamp_dt = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
        else:
            timestamp_dt = datetime.utcnow()
    except Exception as e:
        print("❌ Timestamp parse error:", e)
        timestamp_dt = datetime.utcnow()
    try:
        frame_id = int(frame_id)
    except:
        print("❌ Invalid frame_id, forcing to 0")
        frame_id = 0

    # ---- DETECTIONS FIX ----
    detections = []
    try:
        for d in detections_data:
            d["class_id"] = int(d["class_id"])  # FIX STRING
            detections.append(Detection(**d))
    except Exception as e:
        print("❌ Detection conversion error:", e)
        raise
    

    # ---- ALERT CREATION ----
    try:
        alert = Alert(
            timestamp=timestamp_dt,
            camera_id=PydanticObjectId(camera_id),
            frame_id=frame_id,
            detections=detections,
            status=status,
        )
        await alert.insert()
    except Exception as e:
        print("Failed to save alert")
        raise

    return alert