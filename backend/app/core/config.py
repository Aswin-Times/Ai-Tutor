# ============================================
# EduNex AI Tutor — Core Configuration
# ============================================
# Centralized config loaded from environment variables via Pydantic Settings.

from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator


class Settings(BaseSettings):
    """Application-wide settings, loaded from .env file."""

    # ── App ────────────────────────────────────────────
    app_name: str = Field(default="EduNex AI Tutor")
    app_version: str = Field(default="1.0.0")
    debug: bool = Field(default=False)
    cors_origins: str = Field(default="http://localhost:3000,http://localhost:3001")

    # ── Groq AI ────────────────────────────────────────
    groq_api_key: str = Field(default="")
    groq_model: str = Field(default="llama3-8b-8192")

    # ── MongoDB ────────────────────────────────────────
    mongodb_url: str = Field(default="mongodb://localhost:27017")
    mongodb_db_name: str = Field(default="edunex_ai")

    # ── Redis ──────────────────────────────────────────
    redis_url: str = Field(default="redis://localhost:6379/0")

    # ── Memory ─────────────────────────────────────────
    chat_memory_ttl: int = Field(default=3600, description="TTL for chat memory in Redis (seconds)")
    max_memory_messages: int = Field(default=20, description="Max messages kept in short-term memory")

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug_mode(cls, value):
        """Accept common environment mode strings for DEBUG."""
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "production", "prod"}:
                return False
            if normalized in {"development", "dev"}:
                return True
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


@lru_cache
def get_settings() -> Settings:
    """Cached singleton accessor for application settings."""
    return Settings()
