from typing import Optional, Union
from beanie import Document, Link, PydanticObjectId
from pydantic import Field, AnyUrl
from app.global_dto import SafeUser
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
        )

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

class UserSettings(Document):
    ai_detection: bool = Field(default=True)
    alert_priority: str = Field(default='Medium')
    dashboard_alerts: bool = Field(default=True)
    email_alerts: bool = Field(default=False)

class Video(Document):
    id: Optional[PydanticObjectId] = Field(default_factory=PydanticObjectId, alias="_id")
    name: str = Field(min_length=1)

class Photo(Document):
    id: Optional[PydanticObjectId] = Field(default_factory=PydanticObjectId, alias="_id")
    name: str = Field(min_length=1)


class Alert(Document):
    timestamp: datetime
    event_type: str
    camera_id: PydanticObjectId # refers to the camera
    description: str
    status: str
