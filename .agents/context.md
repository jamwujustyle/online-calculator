# Project Conventions & Context

This document maintains the essential architectural and technical rules for the 3D Calculator Pro project to ensure consistency in future development sessions.

## 🏗 Backend Architecture
- **3-Layer Pattern**: Always separate logic into `repo.py` (database), `service.py` (business logic/orchestration), and `route.py` (FastAPI endpoints).
- **Exceptions**: Use custom domain exceptions from `exceptions.py`.
    - Routes should be "thin" and rely on the service layer to raise these exceptions.
    - Global handlers in `error_handlers.py` convert these into standardized JSON responses.
- **UUIDs**: All primary and foreign keys MUST be strings (UUIDv4). Do NOT use auto-incrementing integers.
- **Imports**: Prefer relative imports for internal module communication (e.g., `from . import auth_utils`).

## 🤖 AI Service & Prompting
- **Caching Optimization**: The system prompt MUST remain static (instructions only) to leverage prefix caching.
- **Prompt Structure**:
    - **System**: Detailed instructions, response format requirements, constraints.
    - **User**: Dynamic data only (formatted model stats, parameters).
- **Response Format**: Reasoning (truncated to 50 chars for debugger) + Technical Description + Commercial Pitch.
- **Token Control**: Strictly enforce `max_tokens=250` for response consistency.

## ⚛️ Frontend Architecture
- **State Management**: Zustand with persistent storage. Use composable slices (e.g., `createAuthSlice`, `createProjectsSlice`).
- **API Clients**: Use the shared `apiClient` instance for automatic JSON handling and 401 interceptors.
- **Components**: Prefer Lucide-React for icons and maintain the premium "Glow/Glassmorphism" design aesthetic.

## 🔐 Authentication & OAuth
- **Dual-Verification**: Google Auth supports both OIDC ID Tokens and standard OAuth Access Tokens.
- **Fallback Flow**: If `id_token` verification fails, the service MUST attempt to fetch data from `googleapis.com/oauth2/v3/userinfo` before failing.

## 🛠 Maintenance & Debugging
- **Reasoning Logs**: All AI reasoning must be logged prominently to the server console as `DEBUGGER AI REASONING: <truncated text>`.
- **Database Reset**: If UUID/Schema errors occur, delete `backend/test.db` and restart Docker to trigger SQLAlchemy metadata creation.
