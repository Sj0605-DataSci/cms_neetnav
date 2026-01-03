"""Mentor profile repository."""

from datetime import datetime
from typing import Optional

from uuid import UUID

from app.db.repositories.base import BaseRepository
from app.schemas.mentor import MentorProfile, MentorProfileUpdate


class MentorRepository(BaseRepository):
    table_name = "mentors_profiles"

    @staticmethod
    def _normalize_id(value: str | UUID | None) -> str | None:
        if value is None:
            return None
        return str(value)

    def get_profile(self, user_id: str) -> Optional[MentorProfile]:
        normalized = self._normalize_id(user_id)
        response = self.table().select("*").eq("user_id", normalized).single().execute()
        if not response.data:
            return None
        data = response.data
        return MentorProfile(
            user_id=data["user_id"],
            personal_info=data.get("personal_info") or {},
            academic_info=data.get("academic_info") or {},
            capacity=data.get("capacity", 0),
            assigned_students=data.get("assigned_students", 0),
            documents_verified=data.get("documents_verified", False),
            updated_at=datetime.fromisoformat(data["updated_at"]) if data.get("updated_at") else None,
        )

    def upsert_profile(self, user_id: str | UUID, payload: MentorProfileUpdate) -> MentorProfile:
        normalized_user_id = self._normalize_id(user_id)
        existing = self.get_profile(normalized_user_id)
        personal_info = existing.personal_info if existing else {}
        academic_info = existing.academic_info if existing else {}
        if payload.personal_info:
            personal_info.update(payload.personal_info)
        if payload.academic_info:
            academic_info.update(payload.academic_info)
        capacity = payload.capacity if payload.capacity is not None else (existing.capacity if existing else 0)
        now = datetime.utcnow().isoformat()
        record = {
            "user_id": normalized_user_id,
            "personal_info": personal_info,
            "academic_info": academic_info,
            "capacity": capacity,
            "assigned_students": existing.assigned_students if existing else 0,
            "updated_at": now,
        }
        self.table().upsert(record, on_conflict="user_id").execute()
        return MentorProfile(
            user_id=normalized_user_id,
            personal_info=personal_info,
            academic_info=academic_info,
            capacity=capacity,
            assigned_students=existing.assigned_students if existing else 0,
            documents_verified=existing.documents_verified if existing else False,
            updated_at=datetime.fromisoformat(now),
        )

    def update_assigned_students(self, user_id: str | UUID, delta: int) -> None:
        normalized = self._normalize_id(user_id)
        profile = self.get_profile(normalized)
        new_count = max(0, (profile.assigned_students if profile else 0) + delta)
        self.table().update({"assigned_students": new_count}).eq("user_id", normalized).execute()

    def mark_documents_verified(self, user_id: str | UUID, verified: bool, verifier_id: str | UUID) -> None:
        self.table().update(
            {"documents_verified": verified, "verified_by": self._normalize_id(verifier_id)}
        ).eq("user_id", self._normalize_id(user_id)).execute()

    def list_all(self) -> list[MentorProfile]:
        response = self.table().select("*").execute()
        profiles: list[MentorProfile] = []
        for data in response.data or []:
            profiles.append(
                MentorProfile(
                    user_id=data["user_id"],
                    personal_info=data.get("personal_info") or {},
                    academic_info=data.get("academic_info") or {},
                    capacity=data.get("capacity", 0),
                    assigned_students=data.get("assigned_students", 0),
                    documents_verified=data.get("documents_verified", False),
                    updated_at=datetime.fromisoformat(data["updated_at"]) if data.get("updated_at") else None,
                )
            )
        return profiles


__all__ = ["MentorRepository"]
