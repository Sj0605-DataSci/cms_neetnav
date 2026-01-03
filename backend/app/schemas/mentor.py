"""Mentor profile schemas."""

from datetime import datetime
from typing import Dict, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class MentorProfile(BaseModel):
    user_id: UUID
    personal_info: Dict[str, str] = Field(default_factory=dict)
    academic_info: Dict[str, str] = Field(default_factory=dict)
    capacity: int = 0
    assigned_students: int = 0
    documents_verified: bool = False
    updated_at: Optional[datetime] = None


class MentorProfileUpdate(BaseModel):
    personal_info: Optional[Dict[str, str]] = None
    academic_info: Optional[Dict[str, str]] = None
    capacity: Optional[int] = None


__all__ = ["MentorProfile", "MentorProfileUpdate"]
