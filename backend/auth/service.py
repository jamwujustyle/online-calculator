from jose import jwt, JWTError
from google.oauth2 import id_token
from google.auth.transport import requests
from config import settings
import schemas
from exceptions import AuthException, AlreadyExistsException
from .repo import AuthRepository
import models

class AuthService:
    def __init__(self, repository: AuthRepository):
        self.repository = repository

    def authenticate_user(self, email: str, password: str):
        user = self.repository.get_user_by_email(email)
        if not user or not auth_utils.verify_password(password, user.hashed_password):
            raise AuthException("Incorrect username or password")
        return user

    def create_access_token(self, email: str):
        access_token_expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
        return auth_utils.create_access_token(
            data={"sub": email}, expires_delta=access_token_expires
        )

    def register_user(self, user_data: schemas.UserCreate):
        if self.repository.get_user_by_email(user_data.email):
            raise AlreadyExistsException("Email already registered")
        hashed_password = auth_utils.get_password_hash(user_data.password)
        return self.repository.create_user(user_data.email, hashed_password)

    def get_user_by_email(self, email: str):
        return self.repository.get_user_by_email(email)

    def create_google_user(self, email: str):
        return self.repository.create_user(email, "")

    def verify_token(self, token: str) -> models.User:
        try:
            payload = jwt.decode(token, auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                raise AuthException("Could not validate credentials")
        except JWTError:
            raise AuthException("Could not validate credentials")
        
        user = self.get_user_by_email(email=email)
        if user is None:
            raise AuthException("User not found")
        return user

    def authenticate_google(self, token: str) -> models.User:
        try:
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), settings.google_client_id
            )
            email = idinfo.get("email")
            if not email:
                raise AuthException("Invalid Google token: No email found")

            user = self.get_user_by_email(email=email)
            if not user:
                user = self.create_google_user(email)

            return user
        except ValueError:
            raise AuthException("Invalid Google token")
