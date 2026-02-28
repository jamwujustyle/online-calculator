from pydantic import BaseModel, EmailStr
from typing import Optional, Any, Dict
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None


class ProjectBase(BaseModel):
    title: str
    client_name: Optional[str] = None
    contact: Optional[str] = None
    notes: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdateParams(BaseModel):
    production_params: Optional[Dict[str, Any]] = None
    calculated_results: Optional[Dict[str, Any]] = None

class Project(ProjectBase):
    id: str
    owner_id: str
    created_at: datetime
    
    file_path: Optional[str] = None
    file_status: str
    
    poly_count: Optional[int] = None
    volume_mm3: Optional[float] = None
    dim_x: Optional[float] = None
    dim_y: Optional[float] = None
    dim_z: Optional[float] = None
    
    production_params: Optional[Dict[str, Any]] = None
    calculated_results: Optional[Dict[str, Any]] = None
    
    ai_description: Optional[str] = None
    ai_commercial_text: Optional[str] = None

    class Config:
        from_attributes = True
