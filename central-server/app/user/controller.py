from fastapi import APIRouter, HTTPException, Request
from app.models import User
from app.user.dto import UserMeOut

router = APIRouter()

# ---------------------------
# GET CURRENT USER — PROTECTED
# (Middleware enforces auth)
# ---------------------------
@router.get("/me", response_model=UserMeOut)
async def read_users_me(request: Request):
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return request.state.user
