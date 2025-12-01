import os
import cv2
from app.utils.logging import log_detection  # ADD THIS
from ultralytics import YOLO # type: ignore 
# Your phone's IP camera stream
# CAMERA_URL = "http://192.168.1.30:8080/video"


BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))  # path to app folder
model_path: str = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "models", "best.pt"))
origins = [
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]
print(model_path)
model = YOLO(model_path)
 


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
# def generate_frames(camera_url: str):
#     if model == None:
#         raise RuntimeError("Model not loaded")

#     cap = cv2.VideoCapture(camera_url)
#     frame_id = 0

#     while True:
#         success, frame = cap.read()
#         if not success:
#             break

#         frame_id += 1

#         if frame_id % 2 == 0 or frame_id % 3 == 0:
#             # Run YOLO only on every 3rd frame
#             results = model(frame, verbose=False)
#             annotated_frame = results[0].plot()

#             # Extract detections for logging
#             detections = results[0].boxes
#             for box in detections:
#                 cls_id = int(box.cls[0])
#                 conf = float(box.conf[0])
#                 x1, y1, x2, y2 = map(float, box.xyxy[0])

#                 log_detection({
#                     "frame_id": frame_id,
#                     "camera": camera_url,
#                     "class_id": cls_id,
#                     "class_name": model.names[cls_id],
#                     "confidence": conf,
#                     "bbox": [x1, y1, x2, y2]
#                 })

#             frame_to_send = annotated_frame
#         else:
#             # For other frames, just send the original frame without annotations
#             frame_to_send = frame

#         # Encode frame
#         ret, buffer = cv2.imencode('.jpg', frame_to_send)
#         frame_bytes = buffer.tobytes()

#         yield (b"--frame\r\n"
#                b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n")

#     cap.release()



def generate_frames(camera_url: str):
    if model is None:
        raise RuntimeError("Model not loaded")
    
    print('generate frames called')

    cap = cv2.VideoCapture(camera_url)
    frame_id = 0

    while True:
        success, frame = cap.read()
        if not success:
            break

        frame_id += 1

        # Process every 2nd or 3rd frame
        if frame_id % 2 == 0 or frame_id % 3 == 0:
            results = model(frame, verbose=False)
            annotated_frame = results[0].plot()

            detections = results[0].boxes
            for box in detections:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                x1, y1, x2, y2 = map(float, box.xyxy[0])

                log_detection({
                    "frame_id": frame_id,
                    "camera": camera_url,
                    "class_id": cls_id,
                    "class_name": model.names[cls_id],
                    "confidence": conf,
                    "bbox": [x1, y1, x2, y2]
                })

            frame_to_send = annotated_frame
        else:
            frame_to_send = frame

        # Encode to raw JPEG bytes
        ret, buffer = cv2.imencode('.jpg', frame_to_send)
        yield buffer.tobytes()

    cap.release()