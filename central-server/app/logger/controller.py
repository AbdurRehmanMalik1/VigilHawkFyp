from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Query, Request
from typing import List, Optional
from datetime import datetime, timedelta
from app.models import Alert, Camera, CameraConfiguration, Log
from app.logger.dto import AlertItemOut, AlertDeleteRequest
from beanie.operators import NE, In, Set

router = APIRouter()


@router.get("/me")
async def get_my_logs(
    request: Request,
    limit: int = Query(20, enum=[20, 50, 100]),
    skip: int = Query(0, ge=0),
):
    user = request.state.user

    logs = (
        await Log.find(Log.user_id == user.id)
        .sort("-timestamp")
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    total = await Log.find(Log.user_id == user.id).count()

    return {
        "total": total,
        "limit": limit,
        "skip": skip,
        "data": [
            {
                "timestamp": log.timestamp,
                "event_type": log.event_type,
                "source": log.source,
                "description": log.description,
                "status": log.status,
                "reference_id": str(log.reference_id),
            }
            for log in logs
        ],
    }

@router.post("/fix-priority")
async def fix_alert_priorities(request: Request):
    """
    TEMP API to fix missing priority fields in existing alerts.
    Sets 'Medium' as default priority.
    """
    try:
        # Update all alerts where priority is missing
        res = Alert.find(Alert.priority == None).update(Set({Alert.priority: "Medium"}))
        return {"updated_count": "Alerts updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/alerts", response_model=List[AlertItemOut])
async def list_alerts(
    request: Request,
    skip: int = Query(0, ge=0, description="Number of alerts to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of alerts to return"),
    searchString: Optional[str] = Query(None, description="Filter by camera name or location"),
    priority: Optional[str] = Query(None, description="Filter by priority level (High, Medium, Low)"),
    threatType: Optional[str] = Query(
        None, description="Filter by threat type: weapon, person, both, or neither"
    ),
    fromDate: Optional[str] = Query(None, description="Filter alerts from date (YYYY-MM-DD)"),
    toDate: Optional[str] = Query(None, description="Filter alerts to date (YYYY-MM-DD)"),
):
    user = request.state.user
    user_cameras = await Camera.find(Camera.registered_by == user.id).to_list()

    # filter cameras by search string if provided
    if searchString:
        search_lower = searchString.lower()
        user_cameras = [
            c for c in user_cameras
            if search_lower in (c.name or "").lower()
            or search_lower in (c.location or "").lower()
        ]

    if not user_cameras:
        return []

    camera_ids = [cam.id for cam in user_cameras]
    camera_map = {cam.id: cam for cam in user_cameras}  # avoid re-fetching cameras later

    alerts = (
        await Alert.find(
            In(Alert.camera_id, camera_ids),
            NE(Alert.violation_reasons, []),
        )
        .sort("-timestamp")
        .skip(skip)
        .limit(max(limit, 20))
        .to_list()
    )

    from_datetime = None
    to_datetime = None
    if fromDate:
        try:
            from_datetime = datetime.strptime(fromDate, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid fromDate format. Use YYYY-MM-DD")
    if toDate:
        try:
            to_datetime = datetime.strptime(toDate, "%Y-%m-%d") + timedelta(days=1)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid toDate format. Use YYYY-MM-DD")

    priority_filter = priority.lower() if priority else None
    threat_filter = threatType.lower() if threatType else None
    valid_threat_filters = {"weapon", "person", "both", "neither"}
    if threat_filter and threat_filter not in valid_threat_filters:
        raise HTTPException(
            status_code=400,
            detail="Invalid threatType. Use one of: weapon, person, both, neither",
        )

    result = []
    camera_config_cache: dict[str, CameraConfiguration] = {}

    for alert in alerts:
        if not alert.violation_reasons:
            continue

        camera = camera_map.get(alert.camera_id)  # ← use map, no DB call
        if not camera:
            continue

        if str(alert.camera_id) in camera_config_cache:
            camera_config = camera_config_cache[str(alert.camera_id)]
        else:
            camera_config = await CameraConfiguration.find_one(
                CameraConfiguration.camera_id == alert.camera_id
            )
            assert camera_config is not None, f"Camera Config {alert.camera_id} not found"
            camera_config_cache[str(alert.camera_id)] = camera_config

        priority = alert.priority or (camera_config.alert_priority if camera_config else "Medium")

        violation_reasons = (
            alert.violation_reasons
            if alert.detections and alert.violation_reasons
            else ["Suspicious Activity Detected"]
        )

        if priority_filter and priority.lower() != priority_filter:
            continue
        detection_classes = {d.class_name.lower() for d in alert.detections if d.class_name}
        has_weapon = "weapon" in detection_classes
        has_person = "person" in detection_classes

        if threat_filter == "weapon" and not has_weapon:
            continue
        if threat_filter == "person" and not has_person:
            continue
        if threat_filter == "both" and not (has_weapon and has_person):
            continue
        if from_datetime and alert.timestamp < from_datetime:
            continue
        if to_datetime and alert.timestamp >= to_datetime:
            continue

        confidence = max((d.confidence for d in alert.detections), default=0.0)

        result.append(AlertItemOut(
            id=str(alert.id),
            camera_id=str(alert.camera_id),
            priority=priority,
            violation_reasons=violation_reasons,
            camera=camera.name or "Unknown",
            location=camera.location or "Unknown",
            time=alert.timestamp.strftime("%I:%M %p"),
            confidence=confidence,
            imageUrl=None,
        ))

    return result


@router.delete("/alerts/clear", status_code=200)
async def clear_alerts(request: Request, body: AlertDeleteRequest):
    user = request.state.user
    alert_ids_converted = [PydanticObjectId(id) for id in body.alert_ids]

    alerts = await Alert.find(In(Alert.id, alert_ids_converted)).to_list()
    if not alerts:
        raise HTTPException(status_code=404, detail="No alerts found for the given IDs")

    camera_ids = [alert.camera_id for alert in alerts]
    cameras = await Camera.find(In(Camera.id, camera_ids)).to_list()

    unauthorized = [c for c in cameras if c.registered_by != user.id]
    if unauthorized:
        raise HTTPException(status_code=403, detail="Not authorized to delete some alerts")

    await Alert.find(In(Alert.id, alert_ids_converted)).delete()
    return {"message": "Deleted alerts"}


# -------------------------------
# Delete a single alert by ID
# -------------------------------
@router.delete("/alerts/{alert_id}", status_code=200)
async def delete_alert(alert_id: str, request: Request):
    user = request.state.user

    alert = await Alert.get(PydanticObjectId(alert_id))
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    camera = await Camera.get(alert.camera_id)
    if not camera or camera.registered_by != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this alert")

    await alert.delete()
    return {"message": "Alert deleted successfully"}



