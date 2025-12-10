from typing import Optional
from pydantic import BaseModel
from beanie import PydanticObjectId
from pydantic import Field



class UserSettings(BaseModel):
    ai_detection: bool = Field(default=True)
    alert_priority: str = Field(default='Medium')
    dashboard_alerts: bool = Field(default=True)
    email_alerts: bool = Field(default=False)


class SafeUser(BaseModel):
    id: Optional[PydanticObjectId] = Field(default_factory=PydanticObjectId, alias="id")
    username: str
    email: str
    settings: UserSettings