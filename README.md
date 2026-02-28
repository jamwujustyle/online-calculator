# 3D Calculator Pro

A full-stack 3D model calculator and production cost analyzer.

## Features
- **User Authentication**: Secure JWT-based login and registration.
- **Project Management**: Create, view, and persist calculation sessions per user.
- **3D Model Processing**: Background Celery workers parse STL, OBJ, and 3MF files to automatically extract bounding box dimensions and volume.
- **Interactive 3D Viewer**: Orbit, pan, and inspect models directly in the browser via React Three Fiber.
- **Real-time Cost Engine**: Adjust materials, print settings, and economic parameters. The engine instantly recalculates material costs, labor costs, profit margins, and quotes.
- **AI Integration**: Automatically generate technical descriptions and commercial pitches for models using OpenAI.

## Tech Stack
- Frontend: React 18, Vite, TailwindCSS v4, Zustand, Three.js, React Router
    - **Architecture**: Domain-driven structure with dedicated API clients and composable store slices.
- Backend API: Python 3.13, FastAPI, SQLAlchemy (SQLite), Pydantic
    - **Architecture**: 3-layer pattern (Repository, Service, Route) for strict separation of concerns.
    - **Exception Handling**: Centralized domain-specific exceptions with standardized JSON error reporting.
    - **OAuth**: Robust Google verification supporting both ID and Access tokens with auto-fallback.
- Background Worker: Celery, Redis, Trimesh
- Deployment: Docker Compose

## Getting Started

### 1. Configure Environment

Create `backend/.env` with the following:

```
SECRET_KEY=your-secret-key
REDIS_URL=redis://redis:6379/0
```

The following keys are **optional** — the app works without them but with limited features:

| Key | Where | Without it |
|-----|-------|------------|
| `OPENAI_API_KEY` | `backend/.env` | AI description generation is disabled |
| `GOOGLE_CLIENT_ID` | `backend/.env` + `frontend/.env` as `VITE_GOOGLE_CLIENT_ID` | Google OAuth login is disabled; email/password login still works |

Example full `backend/.env`:
```
SECRET_KEY=your-secret-key
REDIS_URL=redis://redis:6379/0
OPENAI_API_KEY=sk-your-key-here
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 2. Run the Application
The entire stack is orchestrated with Docker Compose.
```bash
docker compose up --build
```

### 3. Access Services
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Testing
Upload any `.stl`, `.obj`, or `.3mf` file after creating a project to calculate costs.
