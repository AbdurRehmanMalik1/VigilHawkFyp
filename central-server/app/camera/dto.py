from datetime import datetime, time
from typing import Literal, Optional
from beanie import PydanticObjectId
from pydantic import BaseModel, AnyUrl

class CameraRegister(BaseModel):
    name: Optional[str]
    location: str
    url: AnyUrl
    registered_by: Optional[PydanticObjectId] = None

class CameraOut(BaseModel):
    id: Optional[PydanticObjectId]
    name: Optional[str]
    location: str
    url: AnyUrl
    created_at: datetime
    registered_by: PydanticObjectId 
    status: str
    rtspUrl: Optional[str] = None


class CameraUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    url: Optional[AnyUrl] = None
    status: Optional[str] = None




class CameraConfigCreate(BaseModel):
    camera_id: PydanticObjectId
    ai_detection: bool
    persons_allowed: int  # must be >= 0, can enforce via validator if needed
    alert_priority: Literal["High", "Medium", "Low"]
    dashboard_alerts: bool
    email_alerts: bool
    allowed_time_range_from: str
    allowed_time_range_to: str


class CameraConfigUpdate(BaseModel):
    ai_detection: Optional[bool] = None
    persons_allowed: Optional[int] = None
    alert_priority: Optional[Literal["High", "Medium", "Low"]] = None
    dashboard_alerts: Optional[bool] = None
    email_alerts: Optional[bool] = None
    allowed_time_range_from: Optional[str] = None
    allowed_time_range_to: Optional[str] = None
