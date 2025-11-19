from typing import Any
from fastapi import FastAPI, Request
from app.database import init_db
from app.auth.controller import router as auth_router
from app.user.controller import router as user_router
from app.middlewares.auth_middleware import auth_middleware


app = FastAPI()

@app.on_event("startup")
async def app_init():
    await init_db()


app.middleware("http")(auth_middleware)

app.include_router(user_router, prefix="/user" , tags=["user"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])
