# Use an official Python image
FROM python:3.11-slim

# Install system dependencies required by OpenCV and ultralytics
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgthread-2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the FastAPI app
COPY app ./app

# Copy the models folder containing best.pt
COPY models /app/models

# Expose the detection server port
EXPOSE 8001

# Command to run the FastAPI server on port 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
