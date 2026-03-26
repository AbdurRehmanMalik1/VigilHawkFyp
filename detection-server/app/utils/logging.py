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