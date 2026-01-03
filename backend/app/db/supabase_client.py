"""Supabase client management."""

from typing import Optional

from supabase import Client, create_client

from app.core.config import settings

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """Return a singleton Supabase client instance."""

    global _supabase_client
    if _supabase_client is None:
        if not settings.supabase_url:
            raise RuntimeError("Supabase URL is not configured")
        api_key = settings.supabase_service_key or settings.supabase_anon_key
        if not api_key:
            raise RuntimeError("Supabase API key is not configured")
        _supabase_client = create_client(settings.supabase_url, api_key)
    return _supabase_client


__all__ = ["get_supabase_client"]
