from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
import constants
from auth import route as auth_route
from projects import route as project_route

from error_handlers import register_handlers

# Create SQLite tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=constants.TITLE,
    description=constants.DESCRIPTION,
    version=constants.VERSION,
    contact=constants.CONTACT,
    license_info=constants.LICENSE_INFO,
    openapi_tags=constants.TAGS_METADATA,
)

# Register central error handlers
register_handlers(app)

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_route.router)
app.include_router(project_route.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": constants.ROOT_MESSAGE}
