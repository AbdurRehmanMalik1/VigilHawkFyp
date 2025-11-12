from typing import Optional
from beanie import Document, PydanticObjectId
from pydantic import Field

class User(Document):
    id: Optional[PydanticObjectId] = Field(default_factory=PydanticObjectId, alias="_id")
    username: str
    email: str
    hashed_password: str

    class Settings:
        name = "users"