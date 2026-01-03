"""Document-related business logic with Supabase Storage."""

from pathlib import Path
from typing import List, Optional
from uuid import uuid4

from app.core.config import settings
from app.db.repositories.documents import DocumentRepository
from app.schemas.document import DocumentMetadata, DocumentUploadResponse
from supabase import Client


class DocumentService:
    def __init__(self, document_repo: DocumentRepository, supabase: Client):
        self.document_repo = document_repo
        self.supabase = supabase

    def _build_storage_key(self, owner_id: str, document_type: str, original_filename: Optional[str]) -> str:
        safe_name = Path(original_filename or "document").name
        extension = Path(safe_name).suffix
        return f"{owner_id}/{document_type}/{uuid4().hex}{extension}"

    def _upload_to_bucket(self, key: str, content: bytes, content_type: Optional[str]) -> str:
        bucket = settings.supabase_storage_bucket
        options = {"upsert": "true"}
        if content_type:
            options["contentType"] = content_type
        result = self.supabase.storage.from_(bucket).upload(key, content, options)
        if getattr(result, "error", None):
            raise RuntimeError(f"Failed to save document: {result.error.message}")
        return key

    def upload(
        self,
        *,
        owner_id: str,
        owner_role: str,
        document_type: str,
        filename: str,
        content: bytes,
        content_type: Optional[str] = None,
    ) -> DocumentUploadResponse:
        # Get document type ID from code
        doc_type_response = self.supabase.table("document_types").select("id").eq("code", document_type).single().execute()
        if not doc_type_response.data:
            raise ValueError(f"Unknown document type: {document_type}")

        document_type_id = doc_type_response.data["id"]

        storage_key = self._build_storage_key(owner_id, document_type, filename)
        path = self._upload_to_bucket(storage_key, content, content_type)
        document = self.document_repo.create_document(
            owner_id=owner_id,
            owner_role=owner_role,
            document_type_id=document_type_id,
            storage_path=path,
        )
        return DocumentUploadResponse(document=document)

    def list_for_owner(self, owner_id: str) -> List[DocumentMetadata]:
        return self.document_repo.list_documents(owner_id)

    def list_pending(self) -> List[DocumentMetadata]:
        return self.document_repo.list_pending_documents()

    def get_document_url(self, document_id: str, expires_in: int = 3600) -> Optional[str]:
        """Generate a signed URL for document access."""
        # Get document metadata
        doc_metadata = self.document_repo.get_by_id(document_id)
        if not doc_metadata:
            return None

        # Generate signed URL from Supabase Storage
        try:
            bucket = settings.supabase_storage_bucket
            result = self.supabase.storage.from_(bucket).create_signed_url(
                doc_metadata.storage_path, expires_in
            )
            return result.get('signedURL') if result else None
        except Exception as e:
            print(f"Error generating signed URL: {e}")
    def get_document_download_options(self, document_id: str) -> Optional[dict]:
        """Get available download options for a document."""
        doc_metadata = self.document_repo.get_by_id(document_id)
        if not doc_metadata:
            return None

        options = []
        file_ext = doc_metadata.storage_path.split('.')[-1].lower()

        # Base option - always available (original file)
        options.append({
            "id": "original",
            "format": file_ext.upper(),
            "size": "Original",
            "description": f"Original {file_ext.upper()} file",
            "quality": "Original"
        })

        # Format conversion options - available for all file types
        format_options = []

        # Always include the original format
        original_format = file_ext.upper()
        format_options.append({"format": original_format, "description": f"Original {original_format} file"})

        # Add PDF option for all files (can convert to PDF)
        format_options.append({"format": "PDF", "description": "PDF format (universal)"})

        # Add image-specific formats for images
        if file_ext in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
            format_options.extend([
                {"format": "JPG", "description": "JPEG format (compressed)"},
                {"format": "PNG", "description": "PNG format (lossless)"},
                {"format": "WEBP", "description": "WebP format (modern compression)"}
            ])

        # Add DOC format for PDFs (can convert to Word)
        if file_ext == 'pdf':
            format_options.append({"format": "DOC", "description": "Word document format"})

        # Size/quality options
        size_options = ["Small (under 100KB)", "Medium (100KB-500KB)", "Large (500KB-2MB)", "Original"]

        # Generate all combinations of format and size
        for fmt in format_options:
            for size in size_options:
                options.append({
                    "id": f"{fmt['format'].lower()}_{size.lower().replace(' ', '_').replace('(', '').replace(')', '').replace('-', '_')}",
                    "format": fmt["format"],
                    "size": size,
                    "description": f"{fmt['description']} - {size}",
                    "quality": size.split(' ')[0]  # Small, Medium, Large, Original
                })

        return {
            "document_id": document_id,
            "file_name": f"{doc_metadata.document_code}_{doc_metadata.owner_id}.{file_ext}",
            "original_format": file_ext.upper(),
            "available_formats": list(set([opt["format"] for opt in format_options + [{"format": file_ext.upper()}]])),
            "available_sizes": size_options,
            "options": options
        }
