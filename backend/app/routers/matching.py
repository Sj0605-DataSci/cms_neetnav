"""Matching and assignment routes."""

from fastapi import APIRouter, Depends

from app.core.dependencies import get_matching_service, require_any_role, require_role
from app.schemas.common import UserRole
from app.services.matching_service import MatchingService

router = APIRouter(prefix="/matching", tags=["matching"])


@router.post("/enqueue")
async def enqueue_student(
    matching_service: MatchingService = Depends(get_matching_service),
    current_user=Depends(require_role(UserRole.STUDENT)),
):
    await matching_service.enqueue_student(current_user["sub"])
    return {"status": "queued"}


@router.post("/process")
async def process_queue(
    matching_service: MatchingService = Depends(get_matching_service),
    current_user=Depends(require_any_role({UserRole.ADMIN, UserRole.MENTOR})),
):
    return await matching_service.process_queue()


__all__ = ["router"]
