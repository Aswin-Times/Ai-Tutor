# ============================================
# EduNex AI Tutor — Core Configuration
# ============================================
# Centralized config loaded from environment variables via Pydantic Settings.
#
# ⚠️ SECURITY NOTE:
# Never hardcode API keys, passwords, or tokens in this file.
# All secrets MUST come from the .env file, which is excluded from version control.
# If you suspect any credential has been exposed (e.g. committed to Git),
# rotate it immediately:
#   - Groq: https://console.groq.com/keys
#   - Redis: Your cloud provider's dashboard (Redis Labs / Upstash)

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
    # ⚠️ DO NOT hardcode this value. Set GROQ_API_KEY in .env only.
    groq_api_key: str = Field(default="")
    groq_model: str = Field(default="llama3-8b-8192")

    # ── MongoDB ────────────────────────────────────────
    mongodb_url: str = Field(default="mongodb://localhost:27017")
    mongodb_db_name: str = Field(default="edunex_ai")

    # ── Redis ──────────────────────────────────────────
    # REDIS_URL format: redis://username:password@host:port
    # For cloud Redis with TLS: rediss://username:password@host:port
    # ⚠️ DO NOT hardcode credentials. Set REDIS_URL in .env only.
    redis_url: str = Field(default="redis://localhost:6379/0")

    # Enable TLS/SSL for the Redis connection.
    # Set to True when connecting to cloud Redis providers (Redis Labs, Upstash).
    # If your REDIS_URL uses the rediss:// scheme, SSL is auto-detected regardless.
    redis_ssl: bool = Field(default=False, description="Force SSL for Redis connection")

    # Connection tuning
    redis_connect_timeout: float = Field(
        default=5.0,
        description="Timeout in seconds for establishing a Redis connection",
    )
    redis_socket_timeout: float = Field(
        default=5.0,
        description="Timeout in seconds for individual Redis commands",
    )
    redis_max_retries: int = Field(
        default=3,
        description="Number of connection retry attempts before giving up",
    )
    redis_pool_size: int = Field(
        default=50,
        description="Maximum number of connections in the Redis connection pool",
    )

    # ── Memory ─────────────────────────────────────────
    chat_memory_ttl: int = Field(default=3600, description="TTL for chat memory in Redis (seconds)")
    max_memory_messages: int = Field(default=20, description="Max messages kept in short-term memory")

    # ── Validators ─────────────────────────────────────

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

    @field_validator("groq_api_key", mode="after")
    @classmethod
    def warn_empty_groq_key(cls, value: str) -> str:
        """Warn (but don't crash) if the Groq API key is missing."""
        if not value or value == "gsk_your_groq_api_key_here":
            import warnings
            warnings.warn(
                "GROQ_API_KEY is not set or still has the placeholder value. "
                "AI features will be unavailable.",
                stacklevel=2,
            )
        return value

    # ── Properties ─────────────────────────────────────

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def redis_url_safe(self) -> str:
        """
        Return the Redis URL with credentials masked for safe logging.
        e.g. redis://user:****@host:port -> redis://user:****@host:port
        """
        url = self.redis_url
        if "@" in url:
            scheme_and_creds, host_part = url.rsplit("@", 1)
            # Mask everything after the last colon in the credentials portion
            if ":" in scheme_and_creds:
                parts = scheme_and_creds.rsplit(":", 1)
                return f"{parts[0]}:****@{host_part}"
            return f"{scheme_and_creds}@{host_part}"
        return url

    @property
    def should_use_ssl(self) -> bool:
        """Determine if SSL should be used for Redis based on URL scheme or explicit setting."""
        return self.redis_ssl or self.redis_url.startswith("rediss://")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


@lru_cache
def get_settings() -> Settings:
    """Cached singleton accessor for application settings."""
    return Settings()
