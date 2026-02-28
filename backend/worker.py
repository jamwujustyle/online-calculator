from config import settings
from celery import Celery

redis_url = settings.redis_url

celery_app = Celery("3d_worker", broker=redis_url, backend=redis_url)

import models
import trimesh
from database import SessionLocal

@celery_app.task
def process_3d_file(project_id: str):
    db = SessionLocal()
    try:
        project = db.query(models.Project).filter(models.Project.id == project_id).first()
        if not project or not project.file_path:
            return
            
        file_path = project.file_path
        
        try:
            # Load the mesh using trimesh
            mesh = trimesh.load(file_path, force='mesh')
            
            # Extract basic properties
            poly_count = len(mesh.faces)
            volume = mesh.volume
            
            # Dimensions (bounding box extent)
            extents = mesh.bounding_box.extents
            dim_x = extents[0]
            dim_y = extents[1]
            dim_z = extents[2]
            
            # Update DB with calculations
            project.poly_count = poly_count
            project.volume_mm3 = volume
            project.dim_x = dim_x
            project.dim_y = dim_y
            project.dim_z = dim_z
            project.file_status = "ready"
            
        except Exception as e:
            print(f"Error processing mesh {file_path}: {e}")
            project.file_status = "error"
            
        db.commit()
    finally:
        db.close()
