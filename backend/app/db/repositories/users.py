"""User repository for Supabase persistence."""

from datetime import datetime

from app.core.security import get_password_hash, validate_password_length, verify_password
from app.db.repositories.base import BaseRepository
from app.schemas.common import UserRole
from app.schemas.user import UserCreate, UserPublic


class UserRepository(BaseRepository):
    table_name = "users"

    def create_user(self, payload: UserCreate) -> UserPublic:
        now = datetime.utcnow().isoformat()
        validate_password_length(payload.password)
        data = {
            "email": payload.email,
            "role": payload.role.value,
            "password_hash": get_password_hash(payload.password),
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }
        response = self.table().insert(data).execute()
        record = response.data[0]
        return UserPublic(
            id=record["id"],
            email=record["email"],
            role=UserRole(record["role"]),
            is_active=record["is_active"],
            created_at=datetime.fromisoformat(record["created_at"]),
            updated_at=datetime.fromisoformat(record["updated_at"]),
        )

    def get_by_email(self, email: str) -> dict | None:
        response = self.table().select("*").eq("email", email).single().execute()
        return response.data

    def verify_credentials(self, email: str, password: str) -> dict | None:
        user = self.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user["password_hash"]):
            return None
        return user


__all__ = ["UserRepository"]
