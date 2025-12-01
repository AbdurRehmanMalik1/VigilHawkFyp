# detection-server/app/camera_manager.py
import asyncio
import nats
import json
from app.publisher.central_server import publish_camera

running_tasks = {}  # camera_id -> asyncio.Task

async def command_listener():
    nc = await nats.connect("nats://nats:4222")
    sub = await nc.subscribe("camera.cmd")
    print('connected wit nats?')

    async for msg in sub.messages:
        data = json.loads(msg.data.decode())
        camera_id = data["camera_id"]
        action = data["action"]
        print(msg)

        if action == "start":
            camera_url = data["camera_url"]
            if camera_id not in running_tasks:
                print(f"Starting camera {camera_id}")
                task = asyncio.create_task(
                    publish_camera(camera_url, f"camera.stream.{camera_id}")
                )
                print(f'published {camera_id} and {camera_url}')
                running_tasks[camera_id] = task

        elif action == "stop":
            print(f"Stopping camera {camera_id}")
            task = running_tasks.get(camera_id)
            if task:
                task.cancel()
                del running_tasks[camera_id]