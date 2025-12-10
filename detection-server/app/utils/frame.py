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


def getFrameMeasurement(cap):
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    return [width , height]

def getVideoCapture(camera_url) -> cv2.VideoCapture:
    return cv2.VideoCapture(camera_url)


# def generate_frames(camera_url: str):
#     if model is None:
#         raise RuntimeError("Model not loaded")
    
#     #print('generate frames called')

#     cap = cv2.VideoCapture(camera_url)
#     cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    
#     #print(cap)
#     frame_id = 1

#     while True:
#         if not cap.grab():
#             print("No more frames to grab, breaking")
#             break
#         success, frame = cap.retrieve()
#         if not success:
#             print("No frame retrieved, breaking")
#             break

#         #print(f"[generate_frames] Read frame shape: {frame.shape}")


#         frame_id += 1
#         #print(frame_id)

#         if frame_id % 10 == 0:
#             results = model(frame, verbose=False)
#             annotated_frame = results[0].plot()

#             detections = results[0].boxes
#             #print(f"Detections count: {len(detections)}")
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

#         # frame_resized = cv2.resize(frame_to_send, (640, 480))
#         # assert frame_resized.dtype == np.uint8, "Frame dtype must be uint8"
#         # assert frame_resized.shape == (480, 640, 3), f"Frame shape must be (480, 640, 3)"
        
#         # Yield raw bytes in BGR24 format (numpy array converted to bytes)
#         yield frame_to_send.tobytes()
#         #print(f"[generate_frames] Yielded frame bytes: {len(frame_resized.tobytes())}")

#     cap.release()


#WORKING HAI YAI WA:LA



# def generate_frames(camera_url: str):
#     if model is None:
#         raise RuntimeError("Model not loaded")

#     cap = cv2.VideoCapture(camera_url)
#     cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

#     frame_id = 0

#     while True:
#         if not cap.grab():
#             print("No more frames to grab, breaking")
#             break

#         success, frame = cap.retrieve()
#         if not success:
#             print("Failed to retrieve frame, breaking")
#             break

#         frame_id += 1

#         if frame_id % 8 == 0:  # run YOLO every 10 frames
#             results = model(frame, verbose=False)
#             detections = results[0].boxes

#             # MANUAL FAST DRAW
#             for box in detections:
#                 cls_id = int(box.cls[0])
#                 conf = float(box.conf[0])
#                 x1, y1, x2, y2 = map(int, box.xyxy[0])

#                 class_name = model.names[cls_id]

#                 # Log detection
#                 # log_detection({
#                 #     "frame_id": frame_id,
#                 #     "camera": camera_url,
#                 #     "class_id": cls_id,
#                 #     "class_name": class_name,
#                 #     "confidence": conf,
#                 #     "bbox": [x1, y1, x2, y2]
#                 # })
#                 if class_name == 'person':
#                     color = (255, 0, 0)  # Blue
#                 elif class_name == 'weapon':
#                     color = (0, 0, 255)  # Red
#                 else:
#                     color = (0, 255, 0)  # Green for others

#                 # Draw rectangle
#                 cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

#                 # Draw label text
#                 label = f"{class_name} {conf:.2f}"
#                 cv2.putText(frame, label, (x1, y1 - 5),
#                             cv2.FONT_HERSHEY_PLAIN,
#                             0.6, color, 2)

#         # Stream raw BGR24 bytes (NO resizing)
#         ret, jpeg_buffer = cv2.imencode('.jpg', frame)
#         if not ret:
#             print("Failed to encode frame")
#             continue
#         yield jpeg_buffer.tobytes()

#     cap.release()



# THIS IS OLD WALA
# def generate_frames_rtsp(camera_url: str):
#     if model is None:
#         raise RuntimeError("Model not loaded")
    
#     print('generate frames called')
#     cap = cv2.VideoCapture(camera_url)
#     frame_id = 0

#     while True:
#         success, frame = cap.read()
#         if not success:
#             break

#         frame_id += 1

#         # Process every 2nd or 3rd frame
#         if frame_id % 2 == 0 or frame_id % 3 == 0:
#             results = model(frame, verbose=False)
#             annotated_frame = results[0].plot()

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
#             frame_to_send = frame

#         # Yield raw BGR bytes, NOT JPEG encoded
#         yield frame_to_send.tobytes()



def generate_frames_for_hls(camera_url: str, width: int, height: int, cap):
    if model is None:
        raise RuntimeError("Model not loaded")

    if cap == None:
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

        # Yield raw BGR bytes for FFmpeg stdin
        yield frame.tobytes()

    cap.release()

def generate_frames_rtsp(camera_url: str, width: int , height: int):
    if model is None:
        raise RuntimeError("Model not loaded")

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

        if frame_id % 2 == 0:  # run YOLO every 8 frames
            results = model(frame, verbose=False)
            detections = results[0].boxes

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

        # Yield raw BGR24 bytes (no JPEG encoding)
        yield frame.tobytes()

    cap.release()

def generate_frames(camera_url: str, 
                    resize_width: int = 640, 
                    resize_height: int = 360, 
                    jpeg_quality: int = 50,  # lower quality for speed
                    skip_frames: int = 2):   # encode every 3rd frame

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

        # Run detection every 8 frames (your existing logic)
        # if frame_id % 4 == 0:
        results = model(frame, verbose=False)
        detections = results[0].boxes

        for box in detections:
            cls_id = int(box.cls[0])
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            class_name = model.names[cls_id]

            # Color based on class
            if class_name == 'person':
                color = (255, 0, 0)
            elif class_name == 'weapon':
                color = (0, 0, 255)
            else:
                color = (0, 255, 0)

            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            label = f"{class_name} {float(box.conf[0]):.2f}"
            cv2.putText(frame, label, (x1, y1 - 5),
                        cv2.FONT_HERSHEY_PLAIN, 2, color, 2)

        # Resize frame to lower resolution for faster encoding
        frame_resized = frame #cv2.resize(frame, (resize_width, resize_height))
        ret, jpeg_buffer = cv2.imencode('.jpg', frame_resized, encode_param)
        yield jpeg_buffer.tobytes()                               
        # Skip frames for encoding to reduce CPU load
        # if frame_id % (skip_frames + 1) == 0:
        #     ret, jpeg_buffer = cv2.imencode('.jpg', frame_resized, encode_param)
        #     if not ret:
        #         print("Failed to encode frame")
        #         continue
        #     
        # else:
        #     # Skip encoding this frame, just continue loop
            

    cap.release()