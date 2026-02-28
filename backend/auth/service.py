from datetime import timedelta
from typing import Optional
from jose import jwt
from fastapi import HTTPException, status
from . import auth_utils
import schemas
from .repo import AuthRepository

class AuthService:
    def __init__(self, repository: AuthRepository):
        self.repository = repository

    def authenticate_user(self, email: str, password: str):
        user = self.repository.get_user_by_email(email)
        if not user:
            return False
        if not auth_utils.verify_password(password, user.hashed_password):
            return False
        return user

    def create_access_token(self, email: str):
        access_token_expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
        return auth_utils.create_access_token(
            data={"sub": email}, expires_delta=access_token_expires
        )

    def register_user(self, user_data: schemas.UserCreate):
        hashed_password = auth_utils.get_password_hash(user_data.password)
        return self.repository.create_user(user_data.email, hashed_password)

    def get_user_by_email(self, email: str):
        return self.repository.get_user_by_email(email)

    def create_google_user(self, email: str):
        return self.repository.create_user(email, "")
