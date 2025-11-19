from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, HTMLResponse, FileResponse
from ultralytics import YOLO
from pathlib import Path
import cv2
import numpy as np
import logging
import os

app = FastAPI()

# load later in startup to avoid import-time failures
model = None

# Your phone's IP camera stream
CAMERA_URL = "http://192.168.1.30:8080/video"


BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))  # path to app folder
model_path: str = os.path.abspath(os.path.join(BASE_DIR, "..", "models", "best.pt"))

@app.on_event("startup")
def load_model():
    global model
    try:
        model = YOLO(model_path)
        logging.info("YOLO model loaded")
    except Exception as e:
        logging.exception("Failed to load YOLO model on startup")
        raise

from .utils import log_detection  # ADD THIS

# def generate_frames():
#     if model is None:
#         raise RuntimeError("Model not loaded")

#     cap = cv2.VideoCapture(CAMERA_URL)
#     frame_id = 0

#     while True:
#         success, frame = cap.read()
#         if not success:
#             break

#         frame_id += 1

#         # Run YOLO
#         results = model(frame, verbose=False)
#         annotated_frame = results[0].plot()

#         # 🔥 Extract detections for logging
#         detections = results[0].boxes

#         for box in detections:
#             cls_id = int(box.cls[0])
#             conf = float(box.conf[0])
#             x1, y1, x2, y2 = map(float, box.xyxy[0])

#             log_detection({
#                 "frame_id": frame_id,
#                 "camera": CAMERA_URL,
#                 "class_id": cls_id,
#                 "class_name": model.names[cls_id],
#                 "confidence": conf,
#                 "bbox": [x1, y1, x2, y2]
#             })  

#         # Encode frame
#         ret, buffer = cv2.imencode('.jpg', annotated_frame)
#         frame_bytes = buffer.tobytes()

#         yield (b"--frame\r\n"
#                b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n")

#     cap.release()
def generate_frames():
    if model is None:
        raise RuntimeError("Model not loaded")

    cap = cv2.VideoCapture(CAMERA_URL)
    frame_id = 0

    while True:
        success, frame = cap.read()
        if not success:
            break

        frame_id += 1

        if frame_id % 2 == 0 or frame_id % 3 == 0:
            # Run YOLO only on every 3rd frame
            results = model(frame, verbose=False)
            annotated_frame = results[0].plot()

            # Extract detections for logging
            detections = results[0].boxes
            for box in detections:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                x1, y1, x2, y2 = map(float, box.xyxy[0])

                log_detection({
                    "frame_id": frame_id,
                    "camera": CAMERA_URL,
                    "class_id": cls_id,
                    "class_name": model.names[cls_id],
                    "confidence": conf,
                    "bbox": [x1, y1, x2, y2]
                })

            frame_to_send = annotated_frame
        else:
            # For other frames, just send the original frame without annotations
            frame_to_send = frame

        # Encode frame
        ret, buffer = cv2.imencode('.jpg', frame_to_send)
        frame_bytes = buffer.tobytes()

        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n")

    cap.release()



@app.get("/video_feed")
def video_feed():
    print('video feed requested')
    print(CAMERA_URL)
    return StreamingResponse(generate_frames(),
                             media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/", response_class=HTMLResponse)
def home():
    index_path = Path(__file__).resolve().parent / "index.html"  # backend/apps/index.html
    if not index_path.exists():
        logging.error("index.html not found at %s", index_path)
        raise HTTPException(status_code=404, detail="index.html not found")
    return FileResponse(index_path, media_type="text/html")
# ...existing code...