"""Application configuration module."""

from functools import lru_cache
from typing import Literal, Optional
from pydantic import Field

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Global application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    project_name: str = "Counseling Management System API"
    version: str = "0.1.0"
    environment: Literal["local", "dev", "prod"] = "local"
    enable_docs: bool = True

    supabase_url: str = ""
    supabase_anon_key: str | None = Field(default=None, env="SUPABASE_ANON_KEY")
    supabase_service_key: str | None = Field(default=None, env="SUPABASE_SERVICE_KEY")
    supabase_storage_bucket: str = Field(default="documents", env="SUPABASE_STORAGE_BUCKET")
    database_url: Optional[str] = None

    redis_url: str = "redis://localhost:6379/0"

    jwt_secret_key: str = "super-secret-key"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    default_mentor_capacity: int = 25
    cors_allow_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173", "http://127.0.0.1:5173"])


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
