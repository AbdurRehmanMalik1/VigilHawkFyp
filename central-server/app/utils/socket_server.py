import socketio

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

def get_asgi_app(fastapi_app):
    """
    Wraps the FastAPI app into a single ASGI app that serves HTTP and Socket.IO.
    Return value is the object you export as `app` for uvicorn.
    """
    return socketio.ASGIApp(sio, fastapi_app)