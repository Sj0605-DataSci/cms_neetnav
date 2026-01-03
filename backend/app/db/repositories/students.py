"""Student profile repository."""

from datetime import date, datetime
from typing import Any, Dict, List, Optional

from uuid import UUID

from app.db.repositories.base import BaseRepository
from app.schemas.student import StudentProfile, StudentProfileUpdate


class StudentRepository(BaseRepository):
    table_name = "students_profiles"

    @staticmethod
    def _normalize_id(value: str | UUID | None) -> str | None:
        if value is None:
            return None
        return str(value)

    def get_profile(self, user_id: str) -> Optional[StudentProfile]:
        normalized = self._normalize_id(user_id)
        response = self.table().select("*").eq("user_id", normalized).single().execute()
        if not response.data:
            return None
        data = response.data
        return StudentProfile(
            id=data["id"],
            user_id=data["user_id"],
            name=data.get("name"),
            father_name=data.get("father_name"),
            father_mobile=data.get("father_mobile"),
            mother_name=data.get("mother_name"),
            mother_mobile=data.get("mother_mobile"),
            neet_roll_no=data.get("neet_roll_no"),
            neet_rank=data.get("neet_rank"),
            neet_marks=data.get("neet_marks"),
            application_no=data.get("application_no"),
            dob=date.fromisoformat(data["dob"]) if data.get("dob") else None,
            gender=data.get("gender"),
            neet_mobile=data.get("neet_mobile"),
            whatsapp_no=data.get("whatsapp_no"),
            email=data.get("email"),
            permanent_address=data.get("permanent_address") or {},
            correspondence_address=data.get("correspondence_address") or {},
            bms_counselling_opted=data.get("bms_counselling_opted", False),
            bhs_counselling_opted=data.get("bhs_counselling_opted", False),
            max_budget=data.get("max_budget"),
            minority=data.get("minority", False),
            minority_type=data.get("minority_type"),
            nri_quota=data.get("nri_quota", False),
            special_quotas=data.get("special_quotas") or [],
            domicile_state=data.get("domicile_state"),
            single_child=data.get("single_child", False),
            stayed_in_state_since=data.get("stayed_in_state_since"),
            neet_category=data.get("neet_category"),
            tenth_school_details=data.get("tenth_school_details") or {},
            gap_year=data.get("gap_year", False),
            mentor_id=data.get("mentor_id"),
            documents_verified=data.get("documents_verified", False),
            updated_at=datetime.fromisoformat(data["updated_at"]) if data.get("updated_at") else None,
        )

    def upsert_profile(self, user_id: str | UUID, payload: StudentProfileUpdate) -> StudentProfile:
        normalized_user_id = self._normalize_id(user_id)
        existing = self.get_profile(normalized_user_id)
        now = datetime.utcnow().isoformat()

        # Build update record from payload, falling back to existing values
        record = {
            "user_id": normalized_user_id,
            "name": payload.name if payload.name is not None else (existing.name if existing else None),
            "father_name": payload.father_name if payload.father_name is not None else (existing.father_name if existing else None),
            "father_mobile": payload.father_mobile if payload.father_mobile is not None else (existing.father_mobile if existing else None),
            "mother_name": payload.mother_name if payload.mother_name is not None else (existing.mother_name if existing else None),
            "mother_mobile": payload.mother_mobile if payload.mother_mobile is not None else (existing.mother_mobile if existing else None),
            "neet_roll_no": payload.neet_roll_no if payload.neet_roll_no is not None else (existing.neet_roll_no if existing else None),
            "neet_rank": payload.neet_rank if payload.neet_rank is not None else (existing.neet_rank if existing else None),
            "neet_marks": payload.neet_marks if payload.neet_marks is not None else (existing.neet_marks if existing else None),
            "application_no": payload.application_no if payload.application_no is not None else (existing.application_no if existing else None),
            "dob": payload.dob.isoformat() if payload.dob else (existing.dob.isoformat() if existing and existing.dob else None),
            "neet_category": payload.neet_category if payload.neet_category is not None else (existing.neet_category if existing else None),
            "gender": payload.gender if payload.gender is not None else (existing.gender if existing else None),
            "neet_mobile": payload.neet_mobile if payload.neet_mobile is not None else (existing.neet_mobile if existing else None),
            "whatsapp_no": payload.whatsapp_no if payload.whatsapp_no is not None else (existing.whatsapp_no if existing else None),
            "email": payload.email if payload.email is not None else (existing.email if existing else None),
            "permanent_address": payload.permanent_address if payload.permanent_address is not None else (existing.permanent_address if existing else {}),
            "correspondence_address": payload.correspondence_address if payload.correspondence_address is not None else (existing.correspondence_address if existing else {}),
            "bms_counselling_opted": payload.bms_counselling_opted if payload.bms_counselling_opted is not None else (existing.bms_counselling_opted if existing else False),
            "bhs_counselling_opted": payload.bhs_counselling_opted if payload.bhs_counselling_opted is not None else (existing.bhs_counselling_opted if existing else False),
            "max_budget": payload.max_budget if payload.max_budget is not None else (existing.max_budget if existing else None),
            "minority": payload.minority if payload.minority is not None else (existing.minority if existing else False),
            "minority_type": payload.minority_type if payload.minority_type is not None else (existing.minority_type if existing else None),
            "nri_quota": payload.nri_quota if payload.nri_quota is not None else (existing.nri_quota if existing else False),
            "special_quotas": payload.special_quotas if payload.special_quotas is not None else (existing.special_quotas if existing else []),
            "domicile_state": payload.domicile_state if payload.domicile_state is not None else (existing.domicile_state if existing else None),
            "single_child": payload.single_child if payload.single_child is not None else (existing.single_child if existing else False),
            "stayed_in_state_since": payload.stayed_in_state_since if payload.stayed_in_state_since is not None else (existing.stayed_in_state_since if existing else None),
            "twelfth_school_details": payload.twelfth_school_details if payload.twelfth_school_details is not None else (existing.twelfth_school_details if existing else {}),
            "updated_at": now,
        }

        self.table().upsert(record, on_conflict="user_id").execute()
        return self.get_profile(normalized_user_id)

    def assign_mentor(self, user_id: str | UUID, mentor_id: str | UUID) -> None:
        self.table().update({"mentor_id": self._normalize_id(mentor_id)}).eq("user_id", self._normalize_id(user_id)).execute()

    def mark_documents_verified(self, user_id: str | UUID, verified: bool, verifier_id: str | UUID) -> None:
        self.table().update(
            {"documents_verified": verified, "verified_by": self._normalize_id(verifier_id)}
        ).eq("user_id", self._normalize_id(user_id)).execute()

    def get_required_documents(self, user_id: str | UUID) -> List[Dict[str, Any]]:
        """Get required documents for a student based on their profile."""
        normalized = self._normalize_id(user_id)
        # Call the PostgreSQL function we created in the migration
        query = f"SELECT * FROM get_required_documents_for_student('{normalized}'::uuid)"
        response = self.table().select(query).execute()
        # For now, return the raw results - we'll format them in the service layer
        return response.data or []

    def list_all(self) -> list[StudentProfile]:
        response = self.table().select("*").execute()
        profiles: list[StudentProfile] = []
        for data in response.data or []:
            profiles.append(
                StudentProfile(
                    id=data["id"],
                    user_id=data["user_id"],
                    name=data.get("name"),
                    father_name=data.get("father_name"),
                    father_mobile=data.get("father_mobile"),
                    mother_name=data.get("mother_name"),
                    mother_mobile=data.get("mother_mobile"),
                    neet_roll_no=data.get("neet_roll_no"),
                    neet_rank=data.get("neet_rank"),
                    neet_marks=data.get("neet_marks"),
                    application_no=data.get("application_no"),
                    dob=data.get("dob"),
                    gender=data.get("gender"),
                    neet_mobile=data.get("neet_mobile"),
                    whatsapp_no=data.get("whatsapp_no"),
                    email=data.get("email"),
                    permanent_address=data.get("permanent_address") or {},
                    correspondence_address=data.get("correspondence_address") or {},
                    bms_counselling_opted=data.get("bms_counselling_opted", False),
                    bhs_counselling_opted=data.get("bhs_counselling_opted", False),
                    max_budget=data.get("max_budget"),
                    minority=data.get("minority", False),
                    minority_type=data.get("minority_type"),
                    nri_quota=data.get("nri_quota", False),
                    special_quotas=data.get("special_quotas") or [],
                    domicile_state=data.get("domicile_state"),
                    single_child=data.get("single_child", False),
                    stayed_in_state_since=data.get("stayed_in_state_since"),
                    tenth_school_details=data.get("tenth_school_details") or {},
                    twelfth_school_details=data.get("twelfth_school_details") or {},
                    gap_year=data.get("gap_year", False),
                    neet_category=data.get("neet_category"),
                    mentor_id=data.get("mentor_id"),
                    documents_verified=data.get("documents_verified", False),
                    updated_at=datetime.fromisoformat(data["updated_at"]) if data.get("updated_at") else None,
                    remarks=data.get("remarks"),
                    verified_by=data.get("verified_by"),
                )
            )
        return profiles


__all__ = ["StudentRepository"]
