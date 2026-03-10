# # Use an official Python image
# FROM python:3.11-slim

# # Install system dependencies required by OpenCV, ultralytics AND ffmpeg (for HLS)
# RUN apt-get update && apt-get install -y \
#     libgl1 \
#     libglib2.0-0 \
#     libsm6 \
#     libxrender1 \
#     libxext6 \
#     libgthread-2.0-0 \
#     ffmpeg \
#     && rm -rf /var/lib/apt/lists/*

# # Set the working directory
# WORKDIR /app

# # Copy requirements and install them
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy the FastAPI app
# COPY app ./app

# # Copy the models folder containing best.pt
# COPY models /app/models

# # Create the HLS folder for streaming output
# RUN mkdir -p /tmp/hls

# # Ensure it is writable (important for ffmpeg)
# RUN chmod -R 777 /tmp/hls

# # Expose the detection server port
# EXPOSE 8001

# # Command to run the FastAPI server on port 8001
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]

# Use an official Python image
FROM python:3.11-slim

# Install system dependencies required by OpenCV, ultralytics AND ffmpeg (for HLS)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgthread-2.0-0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy requirements and install them using BuildKit cache
# Enable BuildKit: DOCKER_BUILDKIT=1 docker build .
COPY requirements.txt .

# This uses pip cache mount to speed up rebuilds
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt

# Copy the FastAPI app code
COPY app ./app

# Copy the current models folder
COPY models ./models

# Create the HLS folder for streaming output and make it writable
RUN mkdir -p /tmp/hls && chmod -R 777 /tmp/hls

# Expose the detection server port
EXPOSE 8001

# Run the FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]