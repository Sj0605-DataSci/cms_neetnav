"""Admin-specific API routes."""

from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.dependencies import get_admin_service, get_document_service, require_role
from app.schemas.common import UserRole
from app.schemas.document import DocumentMetadata, DocumentVerificationRequest
from app.schemas.mentor import MentorProfile
from app.schemas.student import StudentProfile
from app.services.admin_service import AdminService
from app.services.document_service import DocumentService

router = APIRouter(prefix="/admin", tags=["admin"])


class VerificationToggle(BaseModel):
    verified: bool


class AssignmentOverrideRequest(BaseModel):
    student_id: str
    mentor_id: str


@router.get("/students", response_model=List[StudentProfile])
def list_students(
    admin_service: AdminService = Depends(get_admin_service),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    return admin_service.list_all_students()


@router.get("/mentors", response_model=List[MentorProfile])
def list_mentors(
    admin_service: AdminService = Depends(get_admin_service),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    return admin_service.list_all_mentors()


@router.get("/documents/pending", response_model=List[DocumentMetadata])
def list_pending_documents(
    admin_service: AdminService = Depends(get_admin_service),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    return admin_service.list_pending_documents()


@router.get("/students/unassigned", response_model=List[StudentProfile])
def list_unassigned_students(
    admin_service: AdminService = Depends(get_admin_service),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    return admin_service.list_unassigned_students()


@router.get("/mentors/{mentor_id}/documents", response_model=List[DocumentMetadata])
def get_mentor_documents(
    mentor_id: str,
    admin_service: AdminService = Depends(get_admin_service),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    return admin_service.get_mentor_documents(mentor_id)


@router.get("/students/{student_id}/documents", response_model=List[DocumentMetadata])
def get_student_documents(
    student_id: str,
    admin_service: AdminService = Depends(get_admin_service),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    return admin_service.get_student_documents(student_id)


@router.get("/documents/{document_id}/url")
def get_document_url(
    document_id: str,
    document_service: DocumentService = Depends(get_document_service),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    """Get signed URL for document viewing/downloading."""
    signed_url = document_service.get_document_url(document_id)
    if not signed_url:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Document not found or URL generation failed")
    return {"url": signed_url}


@router.get("/documents/{document_id}/download-options")
def get_document_download_options(
    document_id: str,
    document_service: DocumentService = Depends(get_document_service),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    """Get available download options for a document."""
    options = document_service.get_document_download_options(document_id)
    if not options:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Document not found")
    return options


@router.post("/students/{student_id}/verify")
def verify_student(
    student_id: str,
    payload: VerificationToggle,
    admin_service: AdminService = Depends(get_admin_service),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    admin_service.verify_student(student_id, payload.verified, current_user["sub"])
    return {"status": "ok"}


@router.post("/mentors/{mentor_id}/verify")
def verify_mentor(
    mentor_id: str,
    payload: VerificationToggle,
    admin_service: AdminService = Depends(get_admin_service),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    admin_service.verify_mentor(mentor_id, payload.verified, current_user["sub"])
    return {"status": "ok"}


@router.post("/documents/verify")
def verify_document(
    payload: DocumentVerificationRequest,
    admin_service: AdminService = Depends(get_admin_service),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    admin_service.verify_document(payload, current_user["sub"])
    return {"status": "ok"}


@router.post("/assignments/override")
def override_assignment(
    payload: AssignmentOverrideRequest,
    admin_service: AdminService = Depends(get_admin_service),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    admin_service.override_assignment(payload.student_id, payload.mentor_id)
    return {"status": "ok"}


__all__ = ["router"]
