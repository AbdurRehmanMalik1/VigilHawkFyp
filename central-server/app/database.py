from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import app.models as models

import os

_client: AsyncIOMotorClient | None = None

async def init_db():
    global _client
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017/mydb")
    _client = AsyncIOMotorClient(MONGO_URI)
    await init_beanie(database=_client.get_default_database(), document_models=[ # type: ignore
        models.User, 
        models.Camera,
        models.Alert,
        models.CameraConfiguration,
        models.Log
    ]) # type: ignore

def get_db() -> AsyncIOMotorDatabase:
    if _client is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return _client.get_default_database()

# async def init_db():
#     global client
#     MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017")
#     DB_NAME = "mydb"  # set your database name here

#     client = AsyncIOMotorClient(MONGO_URI)

#     await init_beanie(
#         database=client[DB_NAME],              # pass the client, not the db or collection
#         document_models=[
#             models.User,
#             models.Camera,
#             models.Alert,
#             models.CameraConfiguration,
#             models.Log,
#         ]
#     )