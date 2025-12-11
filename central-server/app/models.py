from typing import List, Optional
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field, AnyUrl
from app.global_dto import SafeUser, UserSettings
from datetime import datetime


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
    created_at: datetime = Field(default_factory=datetime.utcnow)
    registered_by: PydanticObjectId
    status: str = Field(min_length=1)

    class Settings:
        name = "cameras"

class CameraConfiguration(Document):
    ai_detection: bool = Field(default=True)
    alert_priority: str = Field(min_length=1)
    dashboard_alerts: bool = Field(default=False)
    email_alerts: bool = Field(default=False)
    allowed_time_range_from: datetime
    allowed_time_range_to: datetime
    camera_id: PydanticObjectId


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


    class Settings:
        name = "alerts"  