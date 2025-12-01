# import nats
# from app.utils.frame import generate_frames  # returns JPEG bytes

# async def publish_camera(camera_url: str, subject: str):
#     nc = await nats.connect("nats://nats:4222")
#     js = nc.jetstream()

#     # Create stream if not exists
#     await js.add_stream(
#         name="CAM_STREAM",
#         subjects=[subject]
#     )

#     async for frame in generate_frames(camera_url):
#         await js.publish(subject, frame)

#     await nc.close()