from typing import Optional
from pydantic import BaseModel
from beanie import PydanticObjectId
from pydantic import Field

class SafeUser(BaseModel):
    id: Optional[PydanticObjectId] = Field(default_factory=PydanticObjectId, alias="id")
    username: str
    email: str