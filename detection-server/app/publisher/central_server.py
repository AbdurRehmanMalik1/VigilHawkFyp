import nats
from app.utils.frame import generate_frames

async def publish_camera(camera_url: str, subject: str):
    nc = await nats.connect("nats://nats:4222")
    js = nc.jetstream()

    await js.add_stream(name="CAM_STREAM", subjects=[subject])

    # THIS PART IS IMPORTANT
    for frame in generate_frames(camera_url):   # <-- normal for-loop
        try:
            await js.publish(subject, frame)    # publish JPEG bytes
        except Exception as e:
            print("Publish error:", e)
            break

    await nc.close()
