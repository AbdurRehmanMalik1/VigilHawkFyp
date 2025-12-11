from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Request
from app.global_dto import SafeUser, UserSettings
from app.auth.service import get_user_by_id

router = APIRouter()

# ---------------------------
# GET CURRENT USER — PROTECTED
# (Middleware enforces auth)
# ---------------------------
@router.get("/me", response_model=SafeUser)
async def read_users_me(request: Request):
    return request.state.user


@router.post("/settings/update", response_model=UserSettings)
async def update_user_settings(settings: UserSettings, request: Request):
    user = request.state.user  # lightweight user from middleware

    # Assuming get_user_by_id is async and returns full user ORM/Pydantic model
    comp_user = await get_user_by_id(PydanticObjectId(user.id))
    if not comp_user:
        raise HTTPException(status_code=404, detail="User not found")

    if settings.alert_priority not in {"Low", "Medium", "High", "Critical"}:
        raise HTTPException(status_code=400, detail="Invalid alert priority value")

    try:
        comp_user.settings.ai_detection = settings.ai_detection
        comp_user.settings.alert_priority = settings.alert_priority
        comp_user.settings.dashboard_alerts = settings.dashboard_alerts
        comp_user.settings.email_alerts = settings.email_alerts

        # Save changes
        await comp_user.save()

    except Exception as e:
        # Log e if needed
        raise HTTPException(status_code=500, detail="Failed to update settings")

    return settings