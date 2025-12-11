from beanie import PydanticObjectId
from app.models import User  # Beanie Document with hashed_password field
from app.utils.security import verify_password
from typing import Optional


async def get_user_by_username(username: str) -> Optional[User]:
    user = await User.find_one(User.username == username)
    return user

async def get_user_by_email(email: str) -> Optional[User]:
    user = await User.find_one(User.email == email)
    return user

async def get_user_by_id(id: PydanticObjectId) -> Optional[User]:
    user = await User.find_one(User.id == id)
    return user


async def authenticate_user(email: str, password: str) -> Optional[User]:
    user = await get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user