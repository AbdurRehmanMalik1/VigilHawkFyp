# # from fastapi import APIRouter, HTTPException
# # from fastapi.responses import StreamingResponse, HTMLResponse, FileResponse
# # from pathlib import Path
# # import logging
# # from beanie import PydanticObjectId
# # from app.utils.frame import generate_frames

# # router = APIRouter()

# # @router.get("/video_feed/{id}")
# # def video_feed(id: str):
# #     camera_id = PydanticObjectId(id)
# #     camera_url = "some url"
# #     return StreamingResponse(generate_frames(camera_url),media_type="multipart/x-mixed-replace; boundary=frame")

# # @router.get("/", response_class=HTMLResponse)
# # def home():
# #     index_path = Path(__file__).resolve().parent / "index.html"  # backend/apps/index.html
# #     if not index_path.exists():
# #         logging.error("index.html not found at %s", index_path)
# #         raise HTTPException(status_code=404, detail="index.html not found")
# #     return FileResponse(index_path, media_type="text/html")
# # # ...existing code...
# import nats
# import cv2
# import asyncio
# from app.utils.frame import generate_frames

# async def publish_frames(camera_url):
#     nc = await nats.connect("nats://broker:4222")
#     js = nc.jetstream()

#     for frame in generate_frames(camera_url):
#         await js.publish("cams.stream", frame)

#     await nc.close()