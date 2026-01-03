"""User-related schemas."""

from datetime import datetime

from pydantic import BaseModel, EmailStr
from uuid import UUID

from app.schemas.common import UserRole


class UserBase(BaseModel):
    id: UUID
    email: EmailStr
    role: UserRole
    is_active: bool = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole


class UserPublic(UserBase):
    created_at: datetime
    updated_at: datetime


__all__ = ["UserBase", "UserCreate", "UserPublic"]
