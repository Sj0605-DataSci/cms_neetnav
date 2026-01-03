"""Student-specific API routes."""

from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.core.dependencies import get_student_service, require_role
from app.schemas.common import UserRole
from app.schemas.document import DocumentMetadata, DocumentUploadResponse
from app.schemas.student import (
    DocumentUploadStatus,
    RequiredDocument,
    StudentProfile,
    StudentProfileUpdate,
)
from app.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/me/profile", response_model=Optional[StudentProfile])
def get_my_profile(
    student_service: StudentService = Depends(get_student_service),
    current_user=Depends(require_role(UserRole.STUDENT)),
):
    return student_service.get_profile(current_user["sub"])


@router.put("/me/profile", response_model=StudentProfile)
def update_my_profile(
    payload: StudentProfileUpdate,
    student_service: StudentService = Depends(get_student_service),
    current_user=Depends(require_role(UserRole.STUDENT)),
):
    return student_service.update_profile(current_user["sub"], payload)


@router.get("/me/documents", response_model=List[DocumentMetadata])
def list_my_documents(
    student_service: StudentService = Depends(get_student_service),
    current_user=Depends(require_role(UserRole.STUDENT)),
):
    return student_service.list_documents(current_user["sub"])


@router.post("/me/documents", response_model=DocumentUploadResponse)
async def upload_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    student_service: StudentService = Depends(get_student_service),
    current_user=Depends(require_role(UserRole.STUDENT)),
):
    content = await file.read()
    return student_service.upload_document(
        current_user["sub"],
        document_type=document_type,
        filename=file.filename,
        content=content,
        content_type=file.content_type,
    )


@router.get("/me/required-documents", response_model=List[RequiredDocument])
def get_required_documents(
    student_service: StudentService = Depends(get_student_service),
    current_user=Depends(require_role(UserRole.STUDENT)),
):
    return student_service.get_required_documents(current_user["sub"])


@router.get("/me/upload-status", response_model=DocumentUploadStatus)
def get_upload_status(
    student_service: StudentService = Depends(get_student_service),
    current_user=Depends(require_role(UserRole.STUDENT)),
):
    return student_service.get_upload_status(current_user["sub"])


__all__ = ["router"]
