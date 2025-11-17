import json
from datetime import datetime
from pathlib import Path

# write logs next to the backend package: backend/logs/detections.jsonl
LOG_DIR = Path(__file__).resolve().parent.parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = LOG_DIR / "detections.jsonl"

def log_detection(event: dict):
    event["timestamp"] = datetime.utcnow().isoformat()
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")