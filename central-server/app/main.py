from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from app.database import init_db
from app.auth.controller import router as auth_router
from app.user.controller import router as user_router
from app.camera.controller import router as camera_router
from app.camera import callback_controller as camera_callback
from app.middlewares.auth_middleware import auth_middleware
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ---- STARTUP CODE ----
    await init_db()        # 🟢 your original startup function

    yield

    # ---- SHUTDOWN CODE ----
    # If you want cleanup later, put it here
    # e.g., closing database connections
    # await some_cleanup()
    

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8000",
    "http://127.0.0.1:8001",
    "http://localhost:8082",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # <-- add your frontend origin here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(auth_middleware)


@app.middleware("http")
async def print_request_body(request: Request, call_next):
    body = await request.body()
    print("Request Body:", body.decode('utf-8'))

    async def receive():
        return {"type": "http.request", "body": body}

    request._receive = receive  # Re-assign to allow downstream reading

    response = await call_next(request)
    return response

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(user_router, prefix="/user" , tags=["user"])
app.include_router(camera_router, prefix="/camera" , tags=["camera"])
app.include_router(camera_callback.router)