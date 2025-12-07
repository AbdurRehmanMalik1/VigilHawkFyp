from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.video.controller import router as video_router

app = FastAPI()
origins = [
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     print("Starting FastAPI lifespan...")

#     # STARTUP
#     # asyncio.create_task(test_nats())   # enable if needed
#     asyncio.create_task(command_listener())

#     print("Startup tasks created.")
#     yield

#     # SHUTDOWN
#     print("Shutting down FastAPI... (add cleanup if needed)")
#     # Example:
#     # if nc.is_connected:
#     #    await nc.drain()


# @app.on_event("startup")
# async def app_init():
#     asyncio.create_task(command_listener())
#     #asyncio.create_task(test_nats())



# app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(video_router)


@app.get("/")
async def something():
    return {"message": "Welcome"}


# app.include_router(video_router, prefix="/video" , tags=["video"])