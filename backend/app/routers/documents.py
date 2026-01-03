"""Document management routes."""

from typing import List

from fastapi import APIRouter, Depends

from app.core.dependencies import get_document_service, require_any_role
from app.schemas.common import UserRole
from app.schemas.document import DocumentMetadata
from app.services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/pending", response_model=List[DocumentMetadata])
async def list_pending_documents(
    document_service: DocumentService = Depends(get_document_service),
    current_user=Depends(require_any_role({UserRole.MENTOR, UserRole.ADMIN})),
):
    return document_service.list_pending()


__all__ = ["router"]
