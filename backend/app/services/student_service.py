"""Student-facing business logic."""

from typing import List, Optional

from app.db.repositories.students import StudentRepository
from app.schemas.document import DocumentUploadResponse
from app.schemas.student import (
    DocumentUploadStatus,
    RequiredDocument,
    StudentProfile,
    StudentProfileUpdate,
)
from app.services.document_service import DocumentService


class StudentService:
    def __init__(self, student_repo: StudentRepository, document_service: DocumentService):
        self.student_repo = student_repo
        self.document_service = document_service

    def get_profile(self, user_id: str) -> StudentProfile | None:
        return self.student_repo.get_profile(user_id)

    def update_profile(self, user_id: str, payload: StudentProfileUpdate) -> StudentProfile:
        return self.student_repo.upsert_profile(user_id, payload)

    def upload_document(
        self,
        user_id: str,
        *,
        document_type: str,
        filename: str,
        content: bytes,
        content_type: Optional[str] = None,
    ) -> DocumentUploadResponse:
        return self.document_service.upload(
            owner_id=user_id,
            owner_role="student",
            document_type=document_type,
            filename=filename,
            content=content,
            content_type=content_type,
        )

    def list_documents(self, user_id: str):
        return self.document_service.list_for_owner(user_id)

    def get_required_documents(self, user_id: str) -> List[RequiredDocument]:
        # Get student profile to determine requirements
        profile = self.student_repo.get_profile(user_id)
        if not profile:
            return []

        # Get all document types
        doc_types_response = self.document_service.supabase.table("document_types").select("*").execute()
        doc_types = doc_types_response.data or []

        required_docs = []
        for doc_type in doc_types:
            conditions = doc_type.get("required_conditions", {})
            mandatory = conditions.get("mandatory", False)

            # Apply conditional logic based on profile
            if conditions.get("category") and profile.neet_category != conditions["category"]:
                if isinstance(conditions["category"], list):
                    if profile.neet_category not in conditions["category"]:
                        continue
                else:
                    continue

            if conditions.get("minority") and not profile.minority:
                continue

            if conditions.get("nri_quota") and not profile.nri_quota:
                continue

            if conditions.get("gap_year") and not getattr(profile, 'gap_year', False):
                continue

            if conditions.get("single_child") and not profile.single_child:
                continue

            if conditions.get("special_quotas"):
                has_quota = any(quota in (profile.special_quotas or []) for quota in conditions["special_quotas"])
                if not has_quota:
                    continue

            required_docs.append(RequiredDocument(
                doc_id=doc_type["id"],
                doc_code=doc_type["code"],
                doc_name=doc_type["name"],
                mandatory=mandatory,
                category=doc_type["category"]
            ))

        return required_docs

    def get_upload_status(self, user_id: str) -> DocumentUploadStatus:
        required_docs = self.get_required_documents(user_id)
        uploaded_docs = self.list_documents(user_id)

        # Create a map of uploaded document types
        uploaded_map = {getattr(doc, 'document_code', doc.document_type): doc.status for doc in uploaded_docs}

        documents = []
        total_required = len(required_docs)
        uploaded_count = 0

        for req_doc in required_docs:
            status = "UPLOADED" if req_doc.doc_code in uploaded_map else "NOT_UPLOADED"
            if status == "UPLOADED":
                uploaded_count += 1

            documents.append({
                "doc_code": req_doc.doc_code,
                "status": status
            })

        return DocumentUploadStatus(
            total_required=total_required,
            uploaded=uploaded_count,
            pending=total_required - uploaded_count,
            documents=documents,
        )


__all__ = ["StudentService"]
