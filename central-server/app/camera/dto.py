from datetime import datetime
from typing import Optional
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


class CameraUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    url: Optional[AnyUrl] = None
    status: Optional[str] = None