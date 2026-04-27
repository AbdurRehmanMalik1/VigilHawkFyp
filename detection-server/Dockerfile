# # # Use an official Python image
# # FROM python:3.11-slim

# # # Install system dependencies required by OpenCV, ultralytics AND ffmpeg (for HLS)
# # RUN apt-get update && apt-get install -y \
# #     libgl1 \
# #     libglib2.0-0 \
# #     libsm6 \
# #     libxrender1 \
# #     libxext6 \
# #     libgthread-2.0-0 \
# #     ffmpeg \
# #     && rm -rf /var/lib/apt/lists/*

# # # Set the working directory
# # WORKDIR /app

# # # Copy requirements and install them
# # COPY requirements.txt .
# # RUN pip install --no-cache-dir -r requirements.txt

# # # Copy the FastAPI app
# # COPY app ./app

# # # Copy the models folder containing best.pt
# # COPY models /app/models

# # # Create the HLS folder for streaming output
# # RUN mkdir -p /tmp/hls

# # # Ensure it is writable (important for ffmpeg)
# # RUN chmod -R 777 /tmp/hls

# # # Expose the detection server port
# # EXPOSE 8001

# # # Command to run the FastAPI server on port 8001
# # CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]

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

# # Copy requirements and install them using BuildKit cache
# # Enable BuildKit: DOCKER_BUILDKIT=1 docker build .
# COPY requirements.txt .

# # This uses pip cache mount to speed up rebuilds
# RUN --mount=type=cache,target=/root/.cache/pip \
#     pip install --no-cache-dir -r requirements.txt

# # Copy the FastAPI app code
# COPY app ./app

# # Copy the current models folder
# COPY models ./models

# # Create the HLS folder for streaming output and make it writable
# RUN mkdir -p /tmp/hls && chmod -R 777 /tmp/hls

# # Expose the detection server port
# EXPOSE 8001

# # Run the FastAPI server
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04

# Prevent interactive prompts + stabilize installs
ENV DEBIAN_FRONTEND=noninteractive
ENV PIP_DEFAULT_TIMEOUT=1000

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip (important for torch wheels)
RUN pip3 install --upgrade pip

# Copy requirements first (better caching)
COPY requirements.txt .

# RUN pip3 install --no-cache-dir numpy==1.26.4

# # 🔥 Install PyTorch separately (prevents CUDA download crashes)
# RUN pip3 install --no-cache-dir \
#     --retries 10 \
#     --timeout 1000 \
#     torch==2.2.2+cu121 torchvision==0.17.2+cu121 torchaudio==2.2.2+cu121 \
#     --index-url https://download.pytorch.org/whl/cu121


# # Install remaining dependencies
# RUN pip3 install --no-cache-dir \
#     --retries 10 \
#     --timeout 1000 \
#     -r requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install numpy==1.26.4

# Install PyTorch with cache enabled
RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install \
    --retries 10 \
    --timeout 1000 \
    torch==2.2.2+cu121 torchvision==0.17.2+cu121 torchaudio==2.2.2+cu121 \
    --index-url https://download.pytorch.org/whl/cu121

# Install rest of dependencies (cached)
RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install \
    --retries 10 \
    --timeout 1000 \
    -r requirements.txt

# Copy app code
COPY app ./app
COPY models ./models

# HLS folder
RUN mkdir -p /tmp/hls && chmod -R 777 /tmp/hls

EXPOSE 8001

# IMPORTANT: remove --reload for production GPU stability
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]