import models
import schemas
from exceptions import ProjectNotFoundException
from .repo import ProjectRepository

class ProjectService:
    def __init__(self, repository: ProjectRepository):
        self.repository = repository

    def create_project(self, project_data: schemas.ProjectCreate, user_id: str) -> models.Project:
        return self.repository.create_project(project_data, user_id)

    def get_projects(self, user_id: str, skip: int = 0, limit: int = 100) -> List[models.Project]:
        return self.repository.get_projects(user_id, skip, limit)

    def get_project(self, project_id: str, user_id: str) -> models.Project:
        project = self.repository.get_project(project_id, user_id)
        if project is None:
            raise ProjectNotFoundException(project_id)
        return project

    def update_project_params(self, project_id: str, user_id: str, params: schemas.ProjectUpdateParams) -> models.Project:
        project = self.get_project(project_id, user_id)
        
        if params.production_params is not None:
            project.production_params = params.production_params
        if params.calculated_results is not None:
            project.calculated_results = params.calculated_results
            
        return self.repository.update_project(project)

    def set_project_file(self, project_id: str, user_id: str, file_path: str) -> models.Project:
        project = self.get_project(project_id, user_id)
        project.file_path = file_path
        project.file_status = "processing"
        return self.repository.update_project(project)

    def update_ai_texts(self, project_id: str, user_id: str, ai_description: str, ai_commercial_text: Optional[str] = None) -> models.Project:
        project = self.get_project(project_id, user_id)
        project.ai_description = ai_description
        if ai_commercial_text:
            project.ai_commercial_text = ai_commercial_text
        return self.repository.update_project(project)
