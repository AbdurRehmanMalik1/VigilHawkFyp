from datetime import datetime
from typing import Optional
from app.analytics.service import get_analytics_data
from fastapi import APIRouter, Query, Request


router = APIRouter()



@router.get("/")
async def analytics(
    req: Request,
    start: Optional[datetime] = Query(default=None),
    end: Optional[datetime] = Query(default=None)
):
    user_id = req.state.user.id
    return await get_analytics_data(user_id, start, end)