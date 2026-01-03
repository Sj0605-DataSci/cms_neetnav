-- Add deleted_at column and allow reuploads by soft-deleting old versions
alter table documents add column if not exists deleted_at timestamptz;

alter table documents drop constraint if exists documents_owner_document_type_key;
create unique index if not exists documents_owner_document_type_active_key
    on documents(owner_id, document_type_id)
    where deleted_at is null;
