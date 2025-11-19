from typing import Optional
from beanie import PydanticObjectId
from pydantic import BaseModel, Field
from app.models import User

class UserMeOut(BaseModel):
    id: Optional[PydanticObjectId] = Field(default_factory=PydanticObjectId, alias="_id")
    username: str
    email: str

    @classmethod
    def from_user(cls, user: User) -> "UserMeOut":
        return cls(
            _id=user.id,
            username=user.username,
            email=user.email,
        )