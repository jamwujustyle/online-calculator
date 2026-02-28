from fastapi import APIRouter, Depends, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

import models, schemas
from database import get_db
from exceptions import AuthException
from .repo import AuthRepository
from .service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_NAME = "access_token"
COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 days

def get_auth_service(db: Session = Depends(get_db)):
    repository = AuthRepository(db)
    return AuthService(repository)

def _set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=COOKIE_MAX_AGE,
        path="/",
    )

async def get_current_user(request: Request, auth_service: AuthService = Depends(get_auth_service)):
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise AuthException("Not authenticated")
    return auth_service.verify_token(token)

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, auth_service: AuthService = Depends(get_auth_service)):
    return auth_service.register_user(user)

@router.post("/token")
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), auth_service: AuthService = Depends(get_auth_service)):
    user = auth_service.authenticate_user(form_data.username, form_data.password)
    access_token = auth_service.create_access_token(user.email)
    _set_auth_cookie(response, access_token)
    return {"status": "ok"}

@router.get("/me", response_model=schemas.User)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"status": "ok"}

class GoogleAuthRequest(BaseModel):
    token: str

@router.post("/google")
async def google_auth(request: GoogleAuthRequest, response: Response, auth_service: AuthService = Depends(get_auth_service)):
    user = await auth_service.authenticate_google(request.token)
    access_token = auth_service.create_access_token(user.email)
    _set_auth_cookie(response, access_token)
    return {"status": "ok"}
