"""Authentication related business logic."""

from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status

from app.core.security import create_access_token
from app.db.repositories.students import StudentRepository
from app.db.repositories.mentors import MentorRepository
from app.db.repositories.users import UserRepository
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.common import UserRole
from app.schemas.mentor import MentorProfileUpdate
from app.schemas.student import StudentProfileUpdate
from app.schemas.user import UserCreate


class AuthService:
    def __init__(
        self,
        user_repo: UserRepository,
        student_repo: StudentRepository,
        mentor_repo: MentorRepository,
    ):
        self.user_repo = user_repo
        self.student_repo = student_repo
        self.mentor_repo = mentor_repo

    def login(self, payload: LoginRequest) -> TokenResponse:
        user = self.user_repo.verify_credentials(payload.email, payload.password)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        if user["role"] != payload.role.value:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Role mismatch")
        return self._build_token(str(user["id"]), user["role"])

    def signup(self, payload: UserCreate) -> TokenResponse:
        created = self.user_repo.create_user(payload)
        if payload.role == UserRole.STUDENT:
            self.student_repo.upsert_profile(
                created.id,
                StudentProfileUpdate(email=created.email),
            )
        elif payload.role == UserRole.MENTOR:
            self.mentor_repo.upsert_profile(created.id, MentorProfileUpdate())
        return self._build_token(str(created.id), created.role.value)

    def _build_token(self, subject: str, role: str) -> TokenResponse:
        expires_delta = timedelta(minutes=60)
        expires_at = datetime.now(timezone.utc) + expires_delta
        token = create_access_token(
            subject=subject,
            expires_delta=expires_delta,
            additional_claims={"role": role},
        )
        return TokenResponse(access_token=token, expires_at=expires_at)


__all__ = ["AuthService"]
