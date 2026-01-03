"""Authentication schemas."""

from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.schemas.common import UserRole


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole


__all__ = ["TokenResponse", "LoginRequest"]
