# import json
# from datetime import datetime
# from pathlib import Path

# # write logs next to the backend package: backend/logs/detections.jsonl
# LOG_DIR = Path(__file__).resolve().parent.parent / "logs"
# LOG_DIR.mkdir(parents=True, exist_ok=True)
# LOG_FILE = LOG_DIR / "detections.jsonl"

# def log_detection(event: dict):
#     event["timestamp"] = datetime.utcnow().isoformat()
#     with LOG_FILE.open("a", encoding="utf-8") as f:
#         f.write(json.dumps(event, ensure_ascii=False) + "\n")

import httpx

FASTAPI_CENTRAL_URL = "http://fastapi-server:8000/api/notifications/send"

# Use a global AsyncClient for connection pooling and efficiency
_async_client = httpx.AsyncClient()

async def async_log_detection(log_data: dict):
    try:
        response = await _async_client.post(FASTAPI_CENTRAL_URL, json=log_data, timeout=5)
        response.raise_for_status()
    except Exception as e:
        print(f"Failed to send detection log: {e}")