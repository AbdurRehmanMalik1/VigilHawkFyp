# Vigil Hawk

Vigil Hawk is a multi-service smart surveillance system built with React, FastAPI, MongoDB, and a GPU-enabled AI detection service.

It provides live camera monitoring, per-camera AI rules, analytics, alerts/logs, and real-time updates through Socket.IO.

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- API server: FastAPI (`central-server`)
- AI detection server: FastAPI + Ultralytics + PyTorch CUDA (`detection-server`)
- Database: MongoDB
- Streaming/static delivery: Nginx + HLS folders
- Realtime: Socket.IO

## Project Architecture

This repository is split into three main services:

1. `react-server` (UI)
   - Dashboard pages for cameras, analytics, alerts/logs, settings
   - Camera configuration editor (AI detection, thresholds, alert controls, allowed time range)
   - Calls central API on `http://localhost:8000` and detection API on `http://localhost:8001`

2. `central-server` (core backend)
   - Auth, users, camera management, logs, analytics, notifications
   - MongoDB integration
   - Socket server wrapper for realtime communication

3. `detection-server` (AI/video backend)
   - Runs detection and stream endpoints (RTSP, HLS, MPEG routes)
   - Serves generated HLS content from `/app/videos`
   - Designed for NVIDIA GPU container runtime

## Main Features

- Camera management and camera detail pages
- Per-camera configuration controls:
  - AI detection toggle
  - Persons/weapons allowed thresholds
  - Alert priority and alert channels (dashboard/email)
  - Allowed active time window
- Analytics and logs endpoints/pages
- Real-time updates with Socket.IO
- Containerized multi-service deployment via Docker Compose

## Repository Structure

```text
fyp/
├── central-server/      # FastAPI core API (auth, users, cameras, logs, analytics)
├── detection-server/    # FastAPI AI inference + streaming service
├── react-server/        # React frontend
├── nginx/               # Nginx config for serving video folders
├── videos/              # HLS/media output mount
├── videos_direct/       # Additional media output mount
└── docker-compose.yml   # Full stack orchestration
```

## Prerequisites

- Docker + Docker Compose
- NVIDIA Container Toolkit (recommended for GPU detection service)
- Node.js 18+ (for frontend local dev)
- Python 3.11+ (if running backend services outside Docker)

## Environment Variables

Create a `.env` file in the project root (same level as `docker-compose.yml`):

```env
MONGO_URI=mongodb://mongo:27017/mydb
SECRET_KEY=your_secret_key_here
```

Notes:
- `MONGO_URI` is used by the central API.
- `SECRET_KEY` is used for JWT/auth in the central API.

## Run With Docker (Recommended)

From the root folder:

```bash
docker compose up --build
```

### Default service ports

- Frontend (nginx in `react-server`): `http://localhost:8082`
- Central API: `http://localhost:8000`
- Detection API: `http://localhost:8001`
- MongoDB: `mongodb://localhost:27017`
- Media Nginx (videos): `http://localhost:8083`

## Run Locally (Without Docker)

### 1) Central server

```bash
cd central-server
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2) Detection server

```bash
cd detection-server
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### 3) Frontend

```bash
cd react-server
npm install
npm run dev
```

## Key API Route Groups

### Central API (`:8000`)

- `/auth` - authentication
- `/user` - user management
- `/camera` - camera CRUD and configuration
- `/logs` - logs/alerts data
- `/analytics` - analytics endpoints
- `/notifications` - notifications

### Detection API (`:8001`)

- `/hls_stream` - HLS related routes
- `/video` - video-related routes
- `/rtsp` - RTSP-related routes
- `/hls_static_stream` - static HLS output mount

## Frontend Routes

Main pages currently include:

- `/login`, `/signup`
- `/cameras`
- `/cameras/:camera_id`
- `/analytics`
- `/system-settings`
- `/camera-configuration`
- `/camera-configuration/:camera_id`
- `/alerts-logs`

## Notes for GitHub Presentation

If you want to showcase this project clearly on GitHub:

- Add screenshots/GIFs under a `docs/` folder and link them here
- Include sample API requests/responses for key routes
- Add a short "Demo Video" section with a link
- Document your model and detection accuracy notes in a separate `docs/model.md`

## License

Add your license here (for example, MIT) before publishing publicly.
