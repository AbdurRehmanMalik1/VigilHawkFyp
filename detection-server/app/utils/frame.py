import os
import cv2
import numpy as np
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



# def generate_frames(camera_url: str):
#     if model is None:
#         raise RuntimeError("Model not loaded")
    
#     print('generate frames called')

#     cap = cv2.VideoCapture(camera_url)
#     frame_id = 1

#     while True:
#         success, frame = cap.read()
#         if not success:
#             break

#         frame_id += 1
#         print(frame_id)

#         # frame changed in 1 4 7 10 13 to avoid lag
#         if (frame_id - 1) % 3 != 0:
#             results = model(frame, verbose=False)
#             annotated_frame = results[0].plot()

#             detections = results[0].boxes
#             print(f"Detections count: {len(detections)}")
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
#             frame_to_send = frame

#         # Encode to raw JPEG bytes
#         ret, buffer = cv2.imencode('.jpg', frame_to_send)
#         yield buffer.tobytes()

#     cap.release()

def generate_frames(camera_url: str):
    if model is None:
        raise RuntimeError("Model not loaded")
    
    #print('generate frames called')

    cap = cv2.VideoCapture(camera_url)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    
    #print(cap)
    frame_id = 1

    while True:
        if not cap.grab():
            print("No more frames to grab, breaking")
            break
        success, frame = cap.retrieve()
        if not success:
            print("No frame retrieved, breaking")
            break

        #print(f"[generate_frames] Read frame shape: {frame.shape}")


        frame_id += 1
        #print(frame_id)

        if frame_id % 20 == 0:
            results = model(frame, verbose=False)
            annotated_frame = results[0].plot()

            detections = results[0].boxes
            #print(f"Detections count: {len(detections)}")
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

        frame_resized = cv2.resize(frame_to_send, (640, 480))
        assert frame_resized.dtype == np.uint8, "Frame dtype must be uint8"
        assert frame_resized.shape == (480, 640, 3), f"Frame shape must be (480, 640, 3)"
        
        # Yield raw bytes in BGR24 format (numpy array converted to bytes)
        yield frame_resized.tobytes()
        #print(f"[generate_frames] Yielded frame bytes: {len(frame_resized.tobytes())}")

    cap.release()