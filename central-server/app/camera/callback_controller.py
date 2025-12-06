from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, List

router = APIRouter(prefix="/api/camera", tags=["camera"])

class DetectionPayload(BaseModel):
    camera_id: str
    frame_id: int
    detections: List[Any]

@router.post("/detections")
async def receive_detections(payload: DetectionPayload):
    print("DETECTIONS CALLBACK:", payload.camera_id, "frame:", payload.frame_id, "count:", len(payload.detections))
    return {"status": "ok"}