"""Document upload schemas."""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class DocumentStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUCCESS = "success"
    RE_UPLOAD = "re-upload"


class DocumentMetadata(BaseModel):
    id: str
    owner_id: str
    owner_role: str
    document_type: str
    document_code: str
    storage_path: str
    status: DocumentStatus = DocumentStatus.PENDING
    verifier_id: Optional[str] = None
    verified_at: Optional[datetime] = None
    remarks: Optional[str] = None
    created_at: datetime


class DocumentUploadResponse(BaseModel):
    document: DocumentMetadata


class DocumentUploadRequest(BaseModel):
    document_type: str
    storage_path: str


class DocumentVerificationRequest(BaseModel):
    document_id: str
    status: DocumentStatus
    remarks: Optional[str] = None


__all__ = [
    "DocumentStatus",
    "DocumentMetadata",
    "DocumentUploadResponse",
    "DocumentUploadRequest",
    "DocumentVerificationRequest",
]
