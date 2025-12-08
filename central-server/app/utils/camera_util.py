from urllib.parse import urlparse

from fastapi import HTTPException
import httpx


async def check_camera_url_reachable(camera_url: str):
    parsed_url = urlparse(camera_url)
    scheme = parsed_url.scheme.lower()

    timeout = 5  # seconds

    if scheme in ("http", "https"):
        # HTTP or HTTPS URL - use httpx
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                try:
                    # Try HEAD request first
                    response = await client.head(camera_url)
                    if response.status_code != 200:
                        raise HTTPException(400, f"Camera URL not reachable (status {response.status_code})")
                except httpx.RequestError:
                    # Fallback to GET if HEAD fails
                    response = await client.get(camera_url, timeout=timeout)
                    if response.status_code != 200:
                        raise HTTPException(400, f"Camera URL not reachable (status {response.status_code})")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(500, f"Error while checking camera URL reachability: {e}")

    elif scheme == "rtsp":
        # RTSP URL - use OpenCV or other method (blocking)
        import cv2

        cap = cv2.VideoCapture(camera_url)
        if not cap.isOpened():
            cap.release()
            raise HTTPException(400, "RTSP Camera URL not reachable or cannot open stream")

        ret, frame = cap.read()
        cap.release()
        if not ret:
            raise HTTPException(400, "RTSP Camera stream cannot provide frames")
    else:
        # Unsupported scheme
        raise HTTPException(400, f"Unsupported URL scheme: {scheme}")