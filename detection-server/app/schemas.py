from pydantic import BaseModel
from typing import List, Dict, Any

class DetectionResponse(BaseModel):
    timestamp: str
    camera_id: str
    detections: List[Dict[str, Any]]
