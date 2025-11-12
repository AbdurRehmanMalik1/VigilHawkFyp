from pydantic import BaseModel, EmailStr
from beanie import PydanticObjectId
from typing import Optional


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: Optional[PydanticObjectId]
    username: str
    email: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
