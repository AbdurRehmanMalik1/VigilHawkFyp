# central-server/app/camera_commands.py
import nats
import json

async def send_start_camera(camera_id: str, camera_url: str):
    nc = await nats.connect("nats://nats:4222")
    payload = json.dumps({
        "camera_id": camera_id,
        "camera_url": camera_url,
        "action": "start"
    }).encode()
    await nc.publish("camera.cmd", payload)
    print(f'camera.cmd {camera_url}')
    await nc.close()

async def send_stop_camera(camera_id: str):
    nc = await nats.connect("nats://nats:4222")
    payload = json.dumps({
        "camera_id": camera_id,
        "action": "stop"
    }).encode()
    await nc.publish("camera.cmd", payload)
    await nc.close()
