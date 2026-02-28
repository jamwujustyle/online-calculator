import os
import shutil
from fastapi import UploadFile

class FileService:
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = upload_dir
        if not os.path.exists(self.upload_dir):
            os.makedirs(self.upload_dir)

    async def save_upload_file(self, upload_file: UploadFile, project_id: str) -> str:
        project_dir = os.path.join(self.upload_dir, str(project_id))
        if not os.path.exists(project_dir):
            os.makedirs(project_dir)
        
        file_path = os.path.join(project_dir, upload_file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
            
        return file_path
