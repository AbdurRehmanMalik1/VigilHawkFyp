from typing import Any, Dict, List, Literal, Optional
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field, AnyUrl
from app.global_dto import SafeUser, UserSettings
from datetime import datetime, time


class User(Document):
    id: Optional[PydanticObjectId] = Field(default_factory=PydanticObjectId, alias="_id")
    username: str
    email: str
    hashed_password: str

    def to_safe_user(self):
        return SafeUser(
            id=self.id,               
            username=self.username,
            email=self.email,
            settings=self.settings
        )
    settings: UserSettings = Field(default_factory=UserSettings)
    class Settings:
        name = "users"

class Camera(Document):
    id: Optional[PydanticObjectId] = Field(default_factory=PydanticObjectId, alias="_id")
    name: Optional[str]
    location: str = Field(min_length=1)
    url: AnyUrl
    rtspUrl: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    registered_by: PydanticObjectId
    status: str = Field(min_length=1)

    class Settings:
        name = "cameras"

class CameraConfiguration(Document):
    id: Optional[PydanticObjectId] = Field(default_factory=PydanticObjectId, alias="_id")
    camera_id: PydanticObjectId
    ai_detection: bool = Field(default=True)
    persons_allowed: int = Field(default=1, ge=0)
    alert_priority: Literal["High", "Medium", "Low"] = Field(default="Medium")
    dashboard_alerts: bool = Field(default=True)
    email_alerts: bool = Field(default=False)
    allowed_time_range_from: Optional[str] = None
    allowed_time_range_to: Optional[str] = None

    class Settings:
        name = "camera_configurations"


class Video(Document):
    id: Optional[PydanticObjectId] = Field(default_factory=PydanticObjectId, alias="_id")
    name: str = Field(min_length=1)

class Photo(Document):
    id: Optional[PydanticObjectId] = Field(default_factory=PydanticObjectId, alias="_id")
    name: str = Field(min_length=1)


class Detection(BaseModel):
    class_id: int
    class_name: str
    confidence: float
    bbox: List[int]  # [x1, y1, x2, y2]

class Alert(Document):
    id: Optional[PydanticObjectId] = Field(default_factory=PydanticObjectId, alias="_id")
    timestamp: datetime
    camera_id: PydanticObjectId  # Or your PydanticObjectId type
    frame_id: int
    detections: List[Detection]
    #description: str = ""  # optional description field
    status: str = "new"  # e.g., new, acknowledged, resolved
    violation_reasons: Optional[List[str]] = None
    priority: Optional[str] = None

    class Settings:
        name = "alerts"  

class Log(Document):
    id: Optional[PydanticObjectId] = Field(default_factory=PydanticObjectId, alias="_id")

    timestamp: datetime = Field(default_factory=datetime.utcnow)

    event_type: str = Field(min_length=1)   # free text for now
    category: Optional[str] = None

    source: Optional[str] = None
    description: Optional[str] = None

    status: str = Field(default="Active")
    severity: Optional[str] = None

    user_id: Optional[PydanticObjectId] = None
    reference_id: Optional[PydanticObjectId] = None  # Alert, Camera, etc.

    ip_address: Optional[str] = None

    metadata: Optional[Dict[str, Any]] = None  # flexible JSON-like storage

    class Settings:
        name = "logs"
        