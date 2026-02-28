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
1. **OpenAI API Key**: Add your valid OpenAI API key to `backend/.env`.
2. **Google OAuth2**: Set up a Google Cloud Project with an OAuth Consent Screen and Web Application Credentials. Add your Authorized origin as `http://localhost:3000`. 
   
Place both keys in `backend/.env` like so:
```
OPENAI_API_KEY=sk-your-key-here
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

3. **Frontend Env**: Ensure the Google Client ID is also in `frontend/.env` to enable the login button popup:
```
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
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
There is a sample `cube.obj` in the `samples/` directory which you can upload after creating a project.
