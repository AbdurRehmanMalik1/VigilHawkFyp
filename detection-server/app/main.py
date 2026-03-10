from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.video.rtsp_controller import router as rtsp_router
from app.video.hls_controller import router as hls_router
from app.video.mpeg_controller import router as mpeg_router

app = FastAPI()
origins = [
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

HLS_ROOT = Path("/app/videos")
HLS_ROOT.mkdir(exist_ok=True)
app.mount("/hls_static_stream", StaticFiles(directory=HLS_ROOT), name="hls_static_stream")

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

app.include_router(hls_router , prefix="/hls_stream", tags=["hls_stream"])
app.include_router(mpeg_router , prefix="/video", tags=["video"])
app.include_router(rtsp_router, prefix="/rtsp", tags=["mpeg"])

@app.get("/")
async def something():
    return {"message": "Welcome"}


# app.include_router(video_router, prefix="/video" , tags=["video"])