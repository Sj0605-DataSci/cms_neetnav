"""Authentication routes."""

from fastapi import APIRouter, Depends

from app.core.dependencies import get_auth_service, get_current_user
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signin", response_model=TokenResponse)
def login(payload: LoginRequest, auth_service: AuthService = Depends(get_auth_service)):
    return auth_service.login(payload)


@router.post("/signup", response_model=TokenResponse)
def signup(payload: UserCreate, auth_service: AuthService = Depends(get_auth_service)):
    return auth_service.signup(payload)


def _logout_response():
    return {"status": "ok", "message": "logged out"}


@router.post("/logout")
def logout(current_user=Depends(get_current_user)):
    return _logout_response()


__all__ = ["router"]
