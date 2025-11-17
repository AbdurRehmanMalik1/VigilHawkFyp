from typing import Any
from fastapi import FastAPI
from app.database import init_db
from app.auth.controller import router as auth_router

app = FastAPI()

@app.on_event("startup")
async def app_init():
    await init_db()

app.include_router(auth_router, prefix="/auth", tags=["auth"])

# @app.get("/")
# async def get_users():
#     users = await User.find_all().to_list()
#     return users

# @app.post("/")
# async def create_user(user: User):
#     await user.insert()
#     return user