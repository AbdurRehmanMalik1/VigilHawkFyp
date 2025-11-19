from ultralytics import YOLO
import cv2
import numpy as np

# Load your trained model once (best practice)
model = YOLO("models/best.pt")

def run_detection(image_bytes):
    nparr = np.frombuffer(buffer=image_bytes, dtype=np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    results = model(frame)[0]

    detections = []

    for box in results.boxes:
        cls = int(box.cls[0])
        label = results.names[cls]
        conf = float(box.conf[0])
        x1, y1, x2, y2 = box.xyxy[0].tolist()

        detections.append({
            "class": label,
            "confidence": round(conf, 3),
            "bbox": [x1, y1, x2, y2]
        })

    return detections
