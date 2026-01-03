"""Admin-specific business operations."""

from typing import List

from app.db.repositories.documents import DocumentRepository
from app.db.repositories.mentors import MentorRepository
from app.db.repositories.students import StudentRepository
from app.schemas.document import DocumentMetadata, DocumentVerificationRequest
from app.schemas.mentor import MentorProfile
from app.schemas.student import StudentProfile


class AdminService:
    def __init__(
        self,
        student_repo: StudentRepository,
        mentor_repo: MentorRepository,
        document_repo: DocumentRepository,
    ):
        self.student_repo = student_repo
        self.mentor_repo = mentor_repo
        self.document_repo = document_repo

    def list_all_students(self) -> List[StudentProfile]:
        """List all students for admin dashboard."""
        return self.student_repo.list_all()

    def list_all_mentors(self) -> List[MentorProfile]:
        """List all mentors for admin dashboard."""
        return self.mentor_repo.list_all()

    def list_pending_documents(self) -> List[DocumentMetadata]:
        """List all pending documents for verification."""
        return self.document_repo.list_pending_documents()

    def list_unassigned_students(self) -> List[StudentProfile]:
        """List students without assigned mentors."""
        all_students = self.student_repo.list_all()
        return [student for student in all_students if not student.mentor_id]

    def get_mentor_documents(self, mentor_id: str) -> List[DocumentMetadata]:
        """Get all documents for a specific mentor."""
        return self.document_repo.list_documents(mentor_id)

    def get_student_documents(self, student_id: str) -> List[DocumentMetadata]:
        """Get all documents for a specific student."""
        return self.document_repo.list_documents(student_id)

    def verify_student(self, student_id: str, verified: bool, verifier_id: str) -> None:
        self.student_repo.mark_documents_verified(student_id, verified=verified, verifier_id=verifier_id)

    def verify_mentor(self, mentor_id: str, verified: bool, verifier_id: str) -> None:
        self.mentor_repo.mark_documents_verified(mentor_id, verified=verified, verifier_id=verifier_id)

    def verify_document(self, payload: DocumentVerificationRequest, verifier_id: str) -> None:
        self.document_repo.update_status(payload.document_id, status=payload.status, verifier_id=verifier_id)

    def override_assignment(self, student_id: str, mentor_id: str) -> None:
        self.student_repo.assign_mentor(student_id, mentor_id)
        self.mentor_repo.update_assigned_students(mentor_id, delta=1)


__all__ = ["AdminService"]
