from sqlalchemy import Boolean, Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
import datetime

from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    projects = relationship("Project", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    client_name = Column(String, nullable=True)
    contact = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    
    owner_id = Column(String, ForeignKey("users.id"))
    owner = relationship("User", back_populates="projects")

    # Uploaded model file path
    file_path = Column(String, nullable=True)
    file_status = Column(String, default="pending") # pending, processing, ready, error
    
    # Processed Analysis stats
    poly_count = Column(Integer, nullable=True)
    volume_mm3 = Column(Float, nullable=True)
    dim_x = Column(Float, nullable=True)
    dim_y = Column(Float, nullable=True)
    dim_z = Column(Float, nullable=True)
    
    # Saved Production Parameters from Frontend (JSON)
    production_params = Column(JSON, nullable=True)
    
    # Calculated Results (JSON)
    calculated_results = Column(JSON, nullable=True)
    
    # LLM outputs
    ai_description = Column(Text, nullable=True)
    ai_commercial_text = Column(Text, nullable=True)
