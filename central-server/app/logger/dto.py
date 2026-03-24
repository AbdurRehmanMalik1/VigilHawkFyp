
from typing import List, Optional

from pydantic import AnyUrl, BaseModel


class AlertItemOut(BaseModel):
    id: str
    priority: str  # maps to alert_priority from CameraConfiguration
    violation_reasons: list[str]  # e.g., first detection class name or generic text
    camera: str
    location: str
    time: str
    confidence: float
    imageUrl: Optional[AnyUrl] = None
    camera_id: str




class AlertDeleteRequest(BaseModel):
    alert_ids: List[str]
