"""Mentor-facing business logic."""

from typing import List

from app.db.repositories.documents import DocumentRepository
from app.db.repositories.mentors import MentorRepository
from app.db.repositories.students import StudentRepository
from app.schemas.document import DocumentMetadata, DocumentUploadResponse, DocumentVerificationRequest
from app.schemas.mentor import MentorProfile, MentorProfileUpdate
from app.services.document_service import DocumentService


class MentorService:
    def __init__(
        self,
        mentor_repo: MentorRepository,
        student_repo: StudentRepository,
        document_repo: DocumentRepository,
        document_service: DocumentService,
    ):
        self.mentor_repo = mentor_repo
        self.student_repo = student_repo
        self.document_repo = document_repo
        self.document_service = document_service

    def get_profile(self, user_id: str) -> MentorProfile | None:
        return self.mentor_repo.get_profile(user_id)

    def update_profile(self, user_id: str, payload: MentorProfileUpdate) -> MentorProfile:
        return self.mentor_repo.upsert_profile(user_id, payload)

    def upload_document(
        self,
        user_id: str,
        *,
        document_type: str,
        filename: str,
        content: bytes,
        content_type: str | None = None,
    ) -> DocumentUploadResponse:
        return self.document_service.upload(
            owner_id=user_id,
            owner_role="mentor",
            document_type=document_type,
            filename=filename,
            content=content,
            content_type=content_type,
        )

    def list_documents(self, user_id: str) -> List[DocumentMetadata]:
        return self.document_service.list_for_owner(user_id)

    def list_assigned_students(self, mentor_id: str):
        # Placeholder: would query Supabase view linking mentor -> students
        return []

    def verify_document(self, mentor_id: str, payload: DocumentVerificationRequest):
        self.document_repo.update_status(payload.document_id, status=payload.status, verifier_id=mentor_id)


__all__ = ["MentorService"]
