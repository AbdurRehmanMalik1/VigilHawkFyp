from typing import Any, List, Optional
from beanie import PydanticObjectId
from datetime import datetime
from app.models import CameraConfiguration, Detection, Alert
from fastapi import HTTPException
from app.camera.service import get_camera_configuration
import time

camera_config_cache = {}

CACHE_TTL = 120  # 2 Minutes


async def get_camera_configuration_cached(
    camera_id: PydanticObjectId,
) -> CameraConfiguration:
    now = time.time()

    cache_entry = camera_config_cache.get(str(camera_id))

    if cache_entry and cache_entry["expiry"] > now:
        return cache_entry["data"]

    config = await get_camera_configuration(camera_id)

    # store in cache
    camera_config_cache[str(camera_id)] = {"data": config, "expiry": now + CACHE_TTL}

    return config


def filter_detections_by_priority(detections: list, priority: str) -> list:
    """
    Filters detections based on flipped confidence thresholds:
    High = 0.30, Medium = 0.50, Low = 0.60
    """
    thresholds = {"High": 0.30, "Medium": 0.50, "Low": 0.60}
    conf_threshold = thresholds.get(priority, thresholds["Medium"])
    return [d for d in detections if d.get("confidence", 0) >= conf_threshold]


def check_violation(config: CameraConfiguration, detections: list) -> dict:
    violations: list[str] = []

    if not config.ai_detection:
        return {"violation": False, "reasons": ["AI detection disabled"]}

    person_count = sum(1 for d in detections if d.get("class_name") == "person")

    person_exceeded = False

    if person_count > config.persons_allowed:
        violations.append(
            f"Person limit exceeded ({person_count}/{config.persons_allowed})"
        )
        person_exceeded = True

    if (
        person_exceeded
        and config.allowed_time_range_from
        and config.allowed_time_range_to
    ):
        now = datetime.now().time()

        start = datetime.strptime(config.allowed_time_range_from, "%H:%M:%S").time()
        end = datetime.strptime(config.allowed_time_range_to, "%H:%M:%S").time()

        if not (start <= now <= end):
            violations.append("Outside allowed time range")

    return {"violation": len(violations) > 0, "reasons": violations}


# 🔥 MAIN FUNCTION
async def save_detection_alert(
    camera_id: str,
    frame_id: Any,
    detections_data: List[dict],
    timestamp: Optional[str] = None,
    status: str = "new",
) -> Alert:

    # ---- TIMESTAMP ----
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

    # ---- FRAME ID ----
    try:
        frame_id = int(frame_id)
    except:
        print("❌ Invalid frame_id, forcing to 0")
        frame_id = 0

    # ---- DETECTIONS FIX ----
    detections = []
    raw_detections = []  # 👈 keep raw for rule engine

    try:
        for d in detections_data:
            raw_detections.append(d)  # keep original
            d["class_id"] = int(d["class_id"])
            detections.append(Detection(**d))
    except Exception as e:
        print("❌ Detection conversion error:", e)
        raise

    # ---- FETCH CONFIG ----
    try:
        config = await get_camera_configuration_cached(PydanticObjectId(camera_id))
    except Exception as e:
        print("❌ Config fetch error:", e)
        raise

    priority = config.alert_priority or "Medium"
    filtered_detections = filter_detections_by_priority(raw_detections, priority)

    # ---- CHECK VIOLATION ----
    violation_result = check_violation(config, filtered_detections)

    # override status based on violation
    status = "violation" if violation_result["violation"] else "normal"

    # ---- ALERT CREATION ----
    try:
        alert = Alert(
            timestamp=timestamp_dt,
            camera_id=PydanticObjectId(camera_id),
            frame_id=frame_id,
            detections=detections,
            status=status,
            # optional (if your model supports it)
            violation_reasons=violation_result["reasons"],
            priority=config.alert_priority,
        )
        if len(violation_result):
            await alert.insert()
    except Exception as e:
        print("❌ Failed to save alert:", e)
        raise

    return alert
