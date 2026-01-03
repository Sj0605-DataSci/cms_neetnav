"""Document repository handling metadata persistence."""

from datetime import datetime
from typing import List, Optional

from app.db.repositories.base import BaseRepository
from app.schemas.document import DocumentMetadata, DocumentStatus


class DocumentRepository(BaseRepository):
    table_name = "documents"

    def create_document(
        self,
        *,
        owner_id: str,
        owner_role: str,
        document_type_id: str,
        storage_path: str,
    ) -> DocumentMetadata:
        now = datetime.utcnow().isoformat()
        # Soft delete any prior active document for the same type
        self.table().update({"deleted_at": now}).eq("owner_id", owner_id).eq("document_type_id", document_type_id).is_("deleted_at", None).execute()
        record = {
            "owner_id": owner_id,
            "owner_role": owner_role,
            "document_type_id": document_type_id,
            "storage_path": storage_path,
            "status": DocumentStatus.PENDING.value,
            "deleted_at": None,
            "created_at": now,
        }
        response = self.table().insert(record).execute()
        return self._to_metadata(response.data[0])

    def list_documents(self, owner_id: str) -> List[DocumentMetadata]:
        table = self.table()
        response = (
            table
            .select("*, document_types!inner(code, name)")
            .eq("owner_id", owner_id)
            .is_("deleted_at", None)
            .execute()
        )
        return [self._to_metadata(data) for data in response.data or []]

    def get_by_id(self, document_id: str) -> Optional[DocumentMetadata]:
        # Get document with document type info
        response = self.table().select("""
            *,
            document_types!inner(code, name)
        """).eq("id", document_id).single().execute()

        if not response.data:
            return None

        data = response.data

        # Get owner name based on role
        owner_name = self._get_owner_name(data["owner_id"], data["owner_role"])
        data["owner_name"] = owner_name

        return self._to_metadata(data)

    def _get_owner_name(self, owner_id: str, owner_role: str) -> Optional[str]:
        """Get the display name for an owner based on their role."""
        if not owner_id:
            return None

        try:
            # First try to get from profile based on role
            if owner_role == "mentor":
                mentor_response = self.client.table("mentors_profiles").select("personal_info").eq("user_id", owner_id).execute()
                if mentor_response.data and len(mentor_response.data) > 0:
                    personal_info = mentor_response.data[0].get("personal_info")
                    if personal_info and isinstance(personal_info, dict) and personal_info.get("name"):
                        return personal_info["name"]
            elif owner_role == "student":
                student_response = self.client.table("students_profiles").select("name").eq("user_id", owner_id).execute()
                if student_response.data and len(student_response.data) > 0 and student_response.data[0].get("name"):
                    return student_response.data[0]["name"]

            # Fallback to email from users table (always available)
            user_response = self.client.table("users").select("email").eq("id", owner_id).execute()
            if user_response.data and len(user_response.data) > 0 and user_response.data[0].get("email"):
                return user_response.data[0]["email"]

        except Exception as e:
            print(f"Error getting owner name: {e}")

        return None

    def list_pending_documents(self) -> List[DocumentMetadata]:
        response = self.table().select("*").eq("status", DocumentStatus.PENDING.value).execute()
        return [self._to_metadata(data) for data in response.data or []]

    def update_status(
        self,
        document_id: str,
        *,
        status: DocumentStatus,
        verifier_id: Optional[str] = None,
        remarks: Optional[str] = None,
    ) -> None:
        update_data = {
            "status": status.value,
            "verifier_id": verifier_id,
            "verified_at": datetime.utcnow().isoformat() if verifier_id else None,
            "remarks": remarks,
        }
        self.table().update(update_data).eq("id", document_id).execute()

    @staticmethod
    def _to_metadata(data: dict) -> DocumentMetadata:
        return DocumentMetadata(
            id=data["id"],
            owner_id=data["owner_id"],
            owner_role=data["owner_role"],
            owner_name=data.get("owner_name"),
            document_type=data.get("document_type") or data.get("document_types", {}).get("name", "Unknown"),
            document_code=data.get("document_types", {}).get("code", data.get("document_type", "")),
            storage_path=data["storage_path"],
            status=DocumentStatus(data["status"]),
            verifier_id=data.get("verifier_id"),
            verified_at=datetime.fromisoformat(data["verified_at"]) if data.get("verified_at") else None,
            remarks=data.get("remarks"),
            created_at=datetime.fromisoformat(data["created_at"]),
        )


__all__ = ["DocumentRepository"]
