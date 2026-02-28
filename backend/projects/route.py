from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from auth.route import get_current_user
from .file_service import FileService
from .repo import ProjectRepository
from .service import ProjectService
from exceptions import ProjectNotFoundException, AppException

router = APIRouter(prefix="/projects", tags=["projects"])
file_service = FileService()

def get_project_service(db: Session = Depends(get_db)):
    repository = ProjectRepository(db)
    return ProjectService(repository)

@router.post("/", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, project_service: ProjectService = Depends(get_project_service), current_user: models.User = Depends(get_current_user)):
    return project_service.create_project(project, current_user.id)

@router.get("/", response_model=List[schemas.Project])
def read_projects(skip: int = 0, limit: int = 100, project_service: ProjectService = Depends(get_project_service), current_user: models.User = Depends(get_current_user)):
    return project_service.get_projects(current_user.id, skip, limit)

@router.get("/{project_id}", response_model=schemas.Project)
def read_project(project_id: str, project_service: ProjectService = Depends(get_project_service), current_user: models.User = Depends(get_current_user)):
    return project_service.get_project(project_id, current_user.id)

@router.put("/{project_id}/params", response_model=schemas.Project)
def update_project_params(project_id: str, params: schemas.ProjectUpdateParams, project_service: ProjectService = Depends(get_project_service), current_user: models.User = Depends(get_current_user)):
    return project_service.update_project_params(project_id, current_user.id, params)

@router.post("/{project_id}/upload", response_model=schemas.Project)
async def upload_file(project_id: str, file: UploadFile = File(...), project_service: ProjectService = Depends(get_project_service), current_user: models.User = Depends(get_current_user)):
    # Verify project exists first
    project_service.get_project(project_id, current_user.id)
    
    # Save the file
    file_path = await file_service.save_upload_file(file, project_id)
    
    # Update the database
    updated_project = project_service.set_project_file(project_id, current_user.id, file_path)
    
    # Import and trigger Celery task directly to avoid circular imports at module level
    from worker import process_3d_file
    process_3d_file.delay(updated_project.id)
    
    return updated_project

@router.post("/{project_id}/generate-ai", response_model=schemas.Project)
def generate_project_ai(project_id: str, project_service: ProjectService = Depends(get_project_service), current_user: models.User = Depends(get_current_user)):
    project = project_service.get_project(project_id, current_user.id)
        
    from ai.service import AIService
    ai_service = AIService()
    description, commercial_text = ai_service.generate_ai_texts(project)
    
    if description:
        return project_service.update_ai_texts(project_id, current_user.id, description, commercial_text)
    
    return project
