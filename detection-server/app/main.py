import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.listener.central_server import command_listener
import nats

app = FastAPI()
origins = [
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]


async def test_nats():
    print('testin nats')
    try:
        nc = await nats.connect("nats://nats:4222")
        print("Connected to NATS!")
        sub = await nc.subscribe("camera.cmd")
        print("Subscribed to camera.cmd")

        async for msg in sub.messages:
            print(f"Got message: {msg.data.decode()}")
    except Exception as e:
        print("Error:", e)

print('being read at least')

@app.on_event("startup")
async def app_init():
    asyncio.create_task(command_listener())
    #asyncio.create_task(test_nats())


@app.get("/")
async def something():
    return {"message": "Welcome"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(video_router, prefix="/video" , tags=["video"])