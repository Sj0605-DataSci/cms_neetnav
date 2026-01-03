"""Mentor-specific API routes."""

from typing import List

from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.core.dependencies import get_mentor_service, require_role
from app.schemas.common import UserRole
from app.schemas.document import DocumentMetadata, DocumentUploadResponse, DocumentVerificationRequest
from app.schemas.mentor import MentorProfile, MentorProfileUpdate
from app.services.mentor_service import MentorService

router = APIRouter(prefix="/mentors", tags=["mentors"])


@router.get("/me/profile", response_model=MentorProfile | None)
def get_my_profile(
    mentor_service: MentorService = Depends(get_mentor_service),
    current_user=Depends(require_role(UserRole.MENTOR)),
):
    return mentor_service.get_profile(current_user["sub"])


@router.put("/me/profile", response_model=MentorProfile)
def update_my_profile(
    payload: MentorProfileUpdate,
    mentor_service: MentorService = Depends(get_mentor_service),
    current_user=Depends(require_role(UserRole.MENTOR)),
):
    return mentor_service.update_profile(current_user["sub"], payload)


@router.get("/me/documents", response_model=List[DocumentMetadata])
def list_my_documents(
    mentor_service: MentorService = Depends(get_mentor_service),
    current_user=Depends(require_role(UserRole.MENTOR)),
):
    return mentor_service.list_documents(current_user["sub"])


@router.post("/me/documents", response_model=DocumentUploadResponse)
async def upload_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    mentor_service: MentorService = Depends(get_mentor_service),
    current_user=Depends(require_role(UserRole.MENTOR)),
):
    content = await file.read()
    return mentor_service.upload_document(
        current_user["sub"],
        document_type=document_type,
        filename=file.filename,
        content=content,
        content_type=file.content_type,
    )


@router.get("/me/students", response_model=List[dict])
def list_assigned_students(
    mentor_service: MentorService = Depends(get_mentor_service),
    current_user=Depends(require_role(UserRole.MENTOR)),
):
    return mentor_service.list_assigned_students(current_user["sub"])


@router.post("/documents/verify")
def verify_document(
    payload: DocumentVerificationRequest,
    mentor_service: MentorService = Depends(get_mentor_service),
    current_user=Depends(require_role(UserRole.MENTOR)),
):
    mentor_service.verify_document(current_user["sub"], payload)
    return {"status": "ok"}


__all__ = ["router"]
