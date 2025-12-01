from typing import Optional, Union
from beanie import Document, Link, PydanticObjectId
from pydantic import Field, HttpUrl
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
    location: str
    url: HttpUrl
    created_at: datetime = Field(default_factory=datetime.utcnow)
    registered_by: PydanticObjectId

    class Settings:
        name = "cameras"