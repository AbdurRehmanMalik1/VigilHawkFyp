from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import app.models as models

import os

async def init_db():
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017/mydb")
    client = AsyncIOMotorClient(MONGO_URI)
    await init_beanie(database=client.get_default_database(), document_models=[ # type: ignore
        models.User, models.Camera,models.Alert
    ]) # type: ignore
