import asyncio
import nats

latest_frames = {}  # camera_id -> jpeg bytes

async def consume_frames(camera_id: str):
    nc = await nats.connect("nats://nats:4222")
    js = nc.jetstream()
    subject = f"camera.stream.{camera_id}"

    sub = await js.subscribe(subject)

    async for msg in sub.messages:
        latest_frames[camera_id] = msg.data
        await msg.ack()