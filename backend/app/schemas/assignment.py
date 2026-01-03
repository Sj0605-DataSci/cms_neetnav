"""Assignment-related schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.common import UserRole


class Assignment(BaseModel):
    id: str
    student_id: str
    mentor_id: str
    status: str
    algorithm: str
    created_at: datetime
    updated_at: datetime


class AssignmentQueueItem(BaseModel):
    student_id: str
    requested_at: datetime
    priority: int = 0


__all__ = ["Assignment", "AssignmentQueueItem"]
