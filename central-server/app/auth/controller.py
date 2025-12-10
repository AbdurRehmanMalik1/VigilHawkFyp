from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import  Optional
from app.auth.service import authenticate_user, get_user_by_email
from app.auth.dto import UserCreate, UserOut, Token
from app.utils.jwt import create_access_token
from app.utils.security import get_password_hash
from app.models import User, UserSettings


router = APIRouter()

# ---------------------------
# LOGIN — PUBLIC
# ---------------------------
@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user: Optional[User] = await authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})

    return Token(access_token=access_token, token_type="bearer")



@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(user_create: UserCreate):
    existing_user = await get_user_by_email(user_create.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")

    hashed_password = get_password_hash(user_create.password)

    # Create default settings instance
    default_settings = UserSettings(
        ai_detection=True,
        alert_priority="Medium",
        dashboard_alerts=True,
        email_alerts=False,
    )

    new_user = User(
        username=user_create.username,
        email=user_create.email,
        hashed_password=hashed_password,
        settings=default_settings,
    )

    await new_user.insert()
    return new_user