from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from bson import ObjectId
import psutil

from app.database import get_db


# -----------------------------
# Helper: Default date range
# -----------------------------
def get_default_range(start: Optional[datetime], end: Optional[datetime]):
    if not end:
        end = datetime.utcnow()
    if not start:
        start = end - timedelta(days=7)
    return start, end


# -----------------------------
# Main Analytics Function
# -----------------------------
async def get_analytics_data(
    user_id,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
) -> Dict[str, Any]:

    start, end = get_default_range(start, end)

    db = get_db()
    alerts_col = db["alerts"]
    cameras_col = db["cameras"]

    uid = ObjectId(user_id)  # ensure correct BSON type for $match

    # ----------------------------------
    # 1. TOTAL DETECTIONS
    # ----------------------------------
    cursor = alerts_col.aggregate(
        [
            {
                "$lookup": {
                    "from": "cameras",
                    "localField": "camera_id",
                    "foreignField": "_id",
                    "as": "camera",
                }
            },
            {"$unwind": "$camera"},
            {
                "$match": {
                    "camera.registered_by": uid,
                    "timestamp": {"$gte": start, "$lte": end},
                }
            },
            {"$count": "count"},
        ]
    )
    result = await cursor.to_list(length=None)
    total_detections = result[0]["count"] if result else 0

    # ----------------------------------
    # 2. ACTIVE CAMERAS
    # ----------------------------------
    active_cameras = await cameras_col.count_documents(
        {"registered_by": uid, "status": "Online"}
    )

    # ----------------------------------
    # 3. THREAT TRENDS (LINE)
    # ----------------------------------
    cursor = alerts_col.aggregate(
        [
            {
                "$lookup": {
                    "from": "cameras",
                    "localField": "camera_id",
                    "foreignField": "_id",
                    "as": "camera",
                }
            },
            {"$unwind": "$camera"},
            {
                "$match": {
                    "camera.registered_by": uid,
                    "timestamp": {"$gte": start, "$lte": end},
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}
                    },
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"_id": 1}},
        ]
    )
    threat_trends = await cursor.to_list(length=None)

    # ----------------------------------
    # 4. CAMERA ACTIVITY (BAR)
    # ----------------------------------
    cursor = alerts_col.aggregate(
        [
            {
                "$lookup": {
                    "from": "cameras",
                    "localField": "camera_id",
                    "foreignField": "_id",
                    "as": "camera",
                }
            },
            {"$unwind": "$camera"},
            {
                "$match": {
                    "camera.registered_by": uid,
                    "timestamp": {"$gte": start, "$lte": end},
                }
            },
            {
                "$group": {
                    "_id": "$camera_id",
                    "count": {"$sum": 1},
                    "camera_name": {"$first": "$camera.name"},
                }
            },
            {"$sort": {"count": -1}},
            {"$limit": 5},
            {
                "$project": {
                    "_id": 0,
                    "camera_id": {"$toString": "$_id"},  # serialize ObjectId to string
                    "camera_name": 1,
                    "count": 1,
                }
            },
        ]
    )
    camera_activity = await cursor.to_list(length=None)

    # ----------------------------------
    # 5. THREAT DISTRIBUTION (DONUT)
    # ----------------------------------
    cursor = alerts_col.aggregate(
        [
            {
                "$lookup": {
                    "from": "cameras",
                    "localField": "camera_id",
                    "foreignField": "_id",
                    "as": "camera",
                }
            },
            {"$unwind": "$camera"},
            {
                "$match": {
                    "camera.registered_by": uid,
                    "timestamp": {"$gte": start, "$lte": end},
                }
            },
            # unwind the detections array to get individual detection objects
            {"$unwind": "$detections"},
            {"$group": {"_id": "$detections.class_name", "count": {"$sum": 1}}},
            {"$project": {"_id": 0, "type": "$_id", "count": 1}},
            {"$sort": {"count": -1}},
        ]
    )
    threat_distribution = await cursor.to_list(length=None)

    # ----------------------------------
    # 6. SYSTEM STATS
    # ----------------------------------
    cpu = psutil.cpu_percent(interval=0.5)
    memory = psutil.virtual_memory().percent

    # ----------------------------------
    # FINAL RESPONSE
    # ----------------------------------
    return {
        "kpis": {
            "total_detections": total_detections,
            "active_cameras": active_cameras,
            "avg_response_time": None,
        },
        "threat_trends": threat_trends,
        "camera_activity": camera_activity,
        "threat_distribution": threat_distribution,
        "system": {"cpu": cpu, "memory": memory},
    }
