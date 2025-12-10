from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Dict
from app.utils.socket_server import sio

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

class Notification(BaseModel):
    type: str
    payload: Dict[str, Any]

@router.post("/send")
async def send_notification(msg: Notification):
    data = msg.dict()
    # emit to all connected socket.io clients on default namespace
    await sio.emit("notification", data, namespace="/")
    return {"status": "sent"}