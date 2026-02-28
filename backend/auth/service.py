from datetime import timedelta
import httpx
from jose import jwt, JWTError
from google.oauth2 import id_token
from google.auth.transport import requests
from config import settings
import schemas
from exceptions import AuthException, AlreadyExistsException, AppException, DatabaseException
from .repo import AuthRepository
from . import auth_utils
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

    async def authenticate_google(self, token: str) -> models.User:
        # 1. Try ID Token Verification first
        try:
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), settings.google_client_id
            )
            email = idinfo.get("email")
            if email:
                return await self._get_or_create_google_user(email)
        except Exception:
            # Not an ID Token or verification failed, proceed to Access Token fallback
            pass

        # 2. Fallback: Access Token verification (Userinfo endpoint)
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {token}"}
                )
                if response.status_code == 200:
                    user_data = response.json()
                    email = user_data.get("email")
                    if email:
                        return await self._get_or_create_google_user(email)
        except (AuthException, DatabaseException, AlreadyExistsException):
            # Re-raise our own known exceptions directly
            raise
        except Exception as e:
            # Wrap unexpected errors but keep details
            raise AuthException(f"Google authentication failed: {str(e)}")

        raise AuthException("Invalid Google token")

    async def _get_or_create_google_user(self, email: str) -> models.User:
        user = self.get_user_by_email(email=email)
        if not user:
            # This is where 'create_user' might raise a DatabaseException
            user = self.create_google_user(email)
        return user
