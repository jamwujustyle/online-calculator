import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from auth import route as auth_route
from projects import route as project_route

# Create SQLite tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="3D Cost Calculator API")

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
    return {"status": "ok", "message": "3D Calculator API is running"}
