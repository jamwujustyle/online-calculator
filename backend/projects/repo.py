from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from exceptions import DatabaseException
from sqlalchemy.exc import SQLAlchemyError

class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_project(self, project_data: schemas.ProjectCreate, user_id: str) -> models.Project:
        try:
            db_project = models.Project(**project_data.model_dump(), owner_id=user_id)
            self.db.add(db_project)
            self.db.commit()
            self.db.refresh(db_project)
            return db_project
        except SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseException("Failed to create project", details=str(e))

    def get_projects(self, user_id: str, skip: int = 0, limit: int = 100) -> List[models.Project]:
        return self.db.query(models.Project).filter(models.Project.owner_id == user_id).offset(skip).limit(limit).all()

    def get_project(self, project_id: str, user_id: str) -> Optional[models.Project]:
        return self.db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == user_id).first()

    def update_project(self, project: models.Project) -> models.Project:
        try:
            self.db.commit()
            self.db.refresh(project)
            return project
        except SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseException("Failed to update project", details=str(e))
