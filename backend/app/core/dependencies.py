"""FastAPI dependency utilities."""

from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.redis_client import get_redis_client
from app.db.supabase_client import get_supabase_client
from app.db.repositories.documents import DocumentRepository
from app.db.repositories.mentors import MentorRepository
from app.db.repositories.students import StudentRepository
from app.db.repositories.users import UserRepository
from app.schemas.common import UserRole
from app.services.admin_service import AdminService
from app.services.auth_service import AuthService
from app.services.document_service import DocumentService
from app.services.matching_service import MatchingService
from app.services.mentor_service import MentorService
from app.services.student_service import StudentService
from app.services.assignment_service import AssignmentService


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/signin")


async def get_settings() -> Annotated[type(settings), None]:
    return settings


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> dict:
    return decode_access_token(token)


def get_supabase():
    return get_supabase_client()


def get_redis():
    return get_redis_client()


def get_user_repository(supabase=Depends(get_supabase)):
    return UserRepository(supabase)


def get_student_repository(supabase=Depends(get_supabase)):
    return StudentRepository(supabase)


def get_mentor_repository(supabase=Depends(get_supabase)):
    return MentorRepository(supabase)


def get_document_repository(supabase=Depends(get_supabase)):
    return DocumentRepository(supabase)


def get_auth_service(
    user_repo=Depends(get_user_repository),
    student_repo=Depends(get_student_repository),
    mentor_repo=Depends(get_mentor_repository),
) -> AuthService:
    return AuthService(user_repo, student_repo, mentor_repo)


def get_document_service(
    document_repo=Depends(get_document_repository),
    supabase=Depends(get_supabase),
) -> DocumentService:
    return DocumentService(document_repo, supabase)


def get_student_service(
    student_repo=Depends(get_student_repository),
    document_service=Depends(get_document_service),
) -> StudentService:
    return StudentService(student_repo, document_service)


def get_mentor_service(
    mentor_repo=Depends(get_mentor_repository),
    student_repo=Depends(get_student_repository),
    document_repo=Depends(get_document_repository),
    document_service=Depends(get_document_service),
) -> MentorService:
    return MentorService(mentor_repo, student_repo, document_repo, document_service)


def get_admin_service(
    student_repo=Depends(get_student_repository),
    mentor_repo=Depends(get_mentor_repository),
    document_repo=Depends(get_document_repository),
) -> AdminService:
    return AdminService(student_repo, mentor_repo, document_repo)


def get_assignment_service(redis=Depends(get_redis)) -> AssignmentService:
    return AssignmentService(redis)


def get_matching_service(
    assignment_service=Depends(get_assignment_service),
    student_repo=Depends(get_student_repository),
    mentor_repo=Depends(get_mentor_repository),
) -> MatchingService:
    return MatchingService(assignment_service, student_repo, mentor_repo)


def require_role(required_role: UserRole):
    def dependency(user: Annotated[dict, Depends(get_current_user)]) -> dict:
        if user.get("role") != required_role.value:
            from fastapi import HTTPException, status  # local import to avoid global try/catch

            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return dependency


def require_any_role(allowed_roles: set[UserRole]):
    def dependency(user: Annotated[dict, Depends(get_current_user)]) -> dict:
        if user.get("role") not in {role.value for role in allowed_roles}:
            from fastapi import HTTPException, status

            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return dependency


__all__ = [
    "get_settings",
    "get_current_user",
    "get_supabase",
    "get_redis",
    "get_auth_service",
    "get_document_service",
    "get_student_service",
    "get_mentor_service",
    "get_admin_service",
    "get_assignment_service",
    "get_matching_service",
    "get_user_repository",
    "get_student_repository",
    "get_mentor_repository",
    "get_document_repository",
    "require_role",
    "require_any_role",
]
