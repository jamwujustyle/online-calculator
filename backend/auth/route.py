from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

import models, schemas
from database import get_db
from .repo import AuthRepository
from .service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_auth_service(db: Session = Depends(get_db)):
    repository = AuthRepository(db)
    return AuthService(repository)

async def get_current_user(token: str = Depends(oauth2_scheme), auth_service: AuthService = Depends(get_auth_service)):
    return auth_service.verify_token(token)

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, auth_service: AuthService = Depends(get_auth_service)):
    return auth_service.register_user(user)

@router.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), auth_service: AuthService = Depends(get_auth_service)):
    user = auth_service.authenticate_user(form_data.username, form_data.password)
    access_token = auth_service.create_access_token(user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user

class GoogleAuthRequest(BaseModel):
    token: str

@router.post("/google", response_model=schemas.Token)
async def google_auth(request: GoogleAuthRequest, auth_service: AuthService = Depends(get_auth_service)):
    user = await auth_service.authenticate_google(request.token)
    access_token = auth_service.create_access_token(user.email)
    return {"access_token": access_token, "token_type": "bearer"}
