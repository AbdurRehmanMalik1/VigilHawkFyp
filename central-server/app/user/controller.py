from fastapi import APIRouter, Request
from app.global_dto import SafeUser

router = APIRouter()

# ---------------------------
# GET CURRENT USER — PROTECTED
# (Middleware enforces auth)
# ---------------------------
@router.get("/me", response_model=SafeUser)
async def read_users_me(request: Request):
    return request.state.user
