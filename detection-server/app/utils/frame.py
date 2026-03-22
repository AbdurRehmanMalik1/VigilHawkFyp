import asyncio
import datetime
import os
import cv2
import numpy as np
from app.utils.logging import async_log_detection as log_detection  # async function
from ultralytics import YOLO  # type: ignore

BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))  # path to app folder
model_path: str = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "models", "best.pt"))

model = YOLO(model_path)


def makeTimeStamp():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def getFrameMeasurement(cap):
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    return [width, height]


def getVideoCapture(camera_url) -> cv2.VideoCapture:
    return cv2.VideoCapture(camera_url)


# rtsp to hls
def generate_frames_for_hls(camera_url: str, width: int, height: int, cap, camera_id: str):
    if model is None:
        raise RuntimeError("Model not loaded")

    if cap is None:
        cap = cv2.VideoCapture(camera_url)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25  # fallback FPS

    frame_id = 0

    while True:
        if not cap.grab():
            print("No more frames to grab, breaking")
            break

        success, frame = cap.retrieve()
        if not success or frame is None:
            print("Failed to retrieve frame, breaking")
            break

        # Resize if needed
        if frame.shape[1] != width or frame.shape[0] != height:
            frame = cv2.resize(frame, (width, height))

        frame_id += 1

        # Run detection every 2 frames (adjust if you want)
        if frame_id % 2 == 0:
            results = model(frame, verbose=False)
            detections = results[0].boxes

            detection_list = []

            for box in detections:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                class_name = model.names[cls_id]

                # Color based on class
                if class_name == 'person':
                    color = (255, 0, 0)  # Blue
                elif class_name == 'weapon':
                    color = (0, 0, 255)  # Red
                else:
                    color = (0, 255, 0)  # Green

                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                label = f"{class_name} {conf:.2f}"
                cv2.putText(frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_PLAIN, 2, color, 2)

                detection_list.append({
                    "class_id": cls_id,
                    "class_name": class_name,
                    "confidence": conf,
                    "bbox": [x1, y1, x2, y2]
                })

            if detection_list:
                log_data = {
                    "type": "detection",
                    "timestamp": makeTimeStamp(),
                    "payload": {
                        "frame_id": frame_id,
                        "camera_id": camera_id,
                        "detections": detection_list,
                    }
                }
                asyncio.create_task(log_detection(log_data))

        # Yield raw BGR bytes for FFmpeg stdin
        yield frame.tobytes()

    cap.release()


async def generate_frames_rtsp(camera_url: str, width: int, height: int, cap: cv2.VideoCapture | None, camera_id: str):
    if model is None:
        raise RuntimeError("Model not loaded")

    if cap is None:
        cap = cv2.VideoCapture(camera_url)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25  # fallback to 25 if FPS not available

    frame_id = 0

    while True:
        if not cap.grab():
            print("No more frames to grab, breaking")
            break

        success, frame = cap.retrieve()
        if not success or frame is None:
            print("Failed to retrieve frame, breaking")
            break

        if frame.shape[1] != width or frame.shape[0] != height:
            frame = cv2.resize(frame, (width, height))

        frame_id += 1

        if frame_id % 50 == 0:  # run YOLO every 2 frames
            results = model(frame, verbose=False)
            detections = results[0].boxes

            detection_list = []

            for box in detections:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                class_name = model.names[cls_id]

                if class_name == 'person':
                    color = (255, 0, 0)  # Blue
                elif class_name == 'weapon':
                    color = (0, 0, 255)  # Red
                else:
                    color = (0, 255, 0)  # Green for others

                # Draw bounding box and label
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                label = f"{class_name} {conf:.2f}"
                cv2.putText(frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_PLAIN, 2, color, 2)

                detection_list.append({
                    "class_id": cls_id,
                    "class_name": class_name,
                    "confidence": conf,
                    "bbox": [x1, y1, x2, y2]
                })

            if detection_list:
                log_data = {
                    "type": "detection",
                    "timestamp": makeTimeStamp(),
                    "payload": {
                        "frame_id": frame_id,
                        "camera_id": camera_id,
                        "detections": detection_list,
                    }
                }
                asyncio.create_task(log_detection(log_data))

        # Yield raw BGR24 bytes (no JPEG encoding)
        yield frame.tobytes()
        await asyncio.sleep(0)

    cap.release()


# http stream
def generate_frames(camera_url: str, camera_id: str, jpeg_quality: int = 50):
    if model is None:
        raise RuntimeError("Model not loaded")

    cap = cv2.VideoCapture(camera_url)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    frame_id = 0
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), jpeg_quality]

    while True:
        if not cap.grab():
            print("No more frames to grab, breaking")
            break

        success, frame = cap.retrieve()
        if not success:
            print("Failed to retrieve frame, breaking")
            break

        frame_id += 1
        detection_list = []

        if frame_id % 5 == 0:
            results = model(frame, verbose=False)
            detections = results[0].boxes
            for box in detections:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                class_name = model.names[cls_id]

                # if class_name == 'person':
                #     color = (255, 0, 0)
                # elif class_name == 'weapon':
                #     color = (0, 0, 255)
                # else:
                #     color = (0, 255, 0)

                # cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                # label = f"{class_name} {conf:.2f}"
                # cv2.putText(frame, label, (x1, y1 - 5),
                #             cv2.FONT_HERSHEY_PLAIN, 5, color, 2)

                detection_list.append({
                    "class_id": cls_id,
                    "class_name": class_name,
                    "confidence": conf,
                    "bbox": [x1, y1, x2, y2]
                })
        # results = model(frame, verbose=False)
        # detections = results[0].boxes
        # for box in detections:
        #     cls_id = int(box.cls[0])
        #     conf = float(box.conf[0])
        #     x1, y1, x2, y2 = map(int, box.xyxy[0])
        #     class_name = model.names[cls_id]
        #     detection_list.append({
        #         "class_id": cls_id,
        #         "class_name": class_name,
        #         "confidence": conf,
        #         "bbox": [x1, y1, x2, y2]
        #     })

        if detection_list:
            log_data = {
                "type": "detection",
                "timestamp": makeTimeStamp(),
                "payload": {
                    "frame_id": frame_id,
                    "camera_id": camera_id,
                    "detections": detection_list,
                }
            }
            asyncio.create_task(log_detection(log_data))

        ret, jpeg_buffer = cv2.imencode('.jpg', frame, encode_param)
        yield jpeg_buffer.tobytes()
