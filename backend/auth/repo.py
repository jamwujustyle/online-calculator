from sqlalchemy.orm import Session
from typing import Optional
import models
from exceptions import DatabaseException
from sqlalchemy.exc import SQLAlchemyError

class AuthRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.email == email).first()

    def create_user(self, email: str, hashed_password: str) -> models.User:
        try:
            db_user = models.User(email=email, hashed_password=hashed_password)
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            return db_user
        except SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseException("Failed to create user", details=str(e))
