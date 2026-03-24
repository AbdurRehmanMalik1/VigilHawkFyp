import socketio
from app.logger.service import log_event

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")


async def on_startup():
    await log_event(
        event_type="System Startup",
        category="System",
        source="Application",
        description="System started successfully",
        status="Successful",
        user_id=None,
        reference_id=None,
    )


async def on_shutdown():
    await log_event(
        event_type="System Shutdown",
        category="System",
        source="Application",
        description="System shut down successfully",
        status="Successful",
        user_id=None,
        reference_id=None,
    )


def get_asgi_app(fastapi_app):
    """
    Wraps the FastAPI app into a single ASGI app that serves HTTP and Socket.IO.
    Return value is the object you export as `app` for uvicorn.
    """
    return socketio.ASGIApp(sio, fastapi_app)
