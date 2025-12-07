from datetime import datetime
from typing import Optional
from beanie import PydanticObjectId
from pydantic import BaseModel, HttpUrl

class CameraRegister(BaseModel):
    name: Optional[str]
    location: str
    url: HttpUrl
    registered_by: Optional[PydanticObjectId] = None

class CameraOut(BaseModel):
    id: Optional[PydanticObjectId]
    name: Optional[str]
    location: str
    url: HttpUrl
    created_at: datetime
    registered_by: PydanticObjectId 
    status: str


class CameraUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    url: Optional[HttpUrl] = None
    status: Optional[str] = None