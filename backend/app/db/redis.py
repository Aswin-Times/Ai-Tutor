# ============================================
# EduNex AI Tutor — Redis Async Connection
# ============================================
# Production-ready async Redis client for short-term chat memory and caching.
#
# This module provides:
#   - connect_redis()  → Establish connection with retry logic
#   - close_redis()    → Graceful shutdown
#   - get_redis()      → FastAPI dependency for route injection
#
# Supports secure cloud connections (Redis Labs, Upstash, ElastiCache)
# via URL-based configuration with optional SSL/TLS.
#
# ⚠️ SECURITY: All connection credentials are loaded from environment
# variables via Settings. Never hardcode passwords or URLs here.

import asyncio
import ssl as ssl_module
from typing import Optional

import redis.asyncio as aioredis
from redis.exceptions import (
    AuthenticationError,
    ConnectionError,
    RedisError,
    TimeoutError,
)
from loguru import logger

from app.core.config import get_settings


class RedisClient:
    """
    Async Redis connection manager designed for production stability.

    Features:
        - URL-based connection (supports redis:// and rediss:// schemes)
        - Automatic SSL detection from URL scheme or explicit config
        - Configurable connection pool sizing
        - Retry logic with exponential backoff on startup
        - Graceful degradation when Redis is unavailable
        - Clean shutdown with connection pool closure

    Usage:
        # Managed by FastAPI lifespan (see main.py)
        await redis_client.connect()   # startup
        await redis_client.disconnect() # shutdown

        # In route handlers via dependency injection
        redis = await get_redis()
    """

    def __init__(self) -> None:
        self._client: Optional[aioredis.Redis] = None

    # ── Connection Management ─────────────────────────

    async def connect(self) -> None:
        """
        Establish an asynchronous connection to Redis using REDIS_URL from settings.

        This method:
        1. Reads the REDIS_URL from environment configuration
        2. Determines SSL requirements from URL scheme or explicit config
        3. Creates a connection pool with production-tuned parameters
        4. Validates the connection with a PING command
        5. Retries on transient failures with exponential backoff

        Raises no exceptions — logs errors and sets client to None for
        graceful degradation (the app runs without cache).
        """
        settings = get_settings()
        redis_url = settings.redis_url

        if not redis_url:
            logger.warning(
                "⚠️ REDIS_URL is not configured. "
                "Running without Redis cache — chat memory will use MongoDB only."
            )
            return

        # Log the masked URL so credentials are never leaked to logs
        logger.info(f"🔗 Connecting to Redis at {settings.redis_url_safe}...")

        # Determine SSL configuration
        use_ssl = settings.should_use_ssl

        if use_ssl:
            logger.info("🔒 SSL/TLS enabled for Redis connection")

        # Retry loop with exponential backoff
        max_retries = settings.redis_max_retries
        last_error: Optional[Exception] = None

        for attempt in range(1, max_retries + 1):
            try:
                self._client = await self._create_connection(
                    redis_url=redis_url,
                    use_ssl=use_ssl,
                    settings=settings,
                )

                # Validate with PING — this is the definitive connectivity check
                await self._client.ping()

                logger.info(
                    f"✅ Connected to Cloud Redis successfully (attempt {attempt}/{max_retries})"
                )
                return  # Success — exit retry loop

            except AuthenticationError as e:
                # Auth errors are NOT transient — retrying won't help
                logger.error(
                    f"❌ Redis authentication failed. "
                    f"Check the username/password in REDIS_URL. Error: {e}"
                )
                self._client = None
                return  # Don't retry on auth failures

            except (ConnectionError, TimeoutError, OSError) as e:
                last_error = e
                self._client = None

                if attempt < max_retries:
                    # Exponential backoff: 1s, 2s, 4s, ...
                    delay = 2 ** (attempt - 1)
                    logger.warning(
                        f"⚠️ Redis connection attempt {attempt}/{max_retries} failed: {e}. "
                        f"Retrying in {delay}s..."
                    )
                    await asyncio.sleep(delay)
                else:
                    logger.error(
                        f"❌ Redis connection failed after {max_retries} attempts. "
                        f"Last error: {e}. Running in degraded mode without cache."
                    )

            except RedisError as e:
                # Catch-all for any other Redis-specific errors
                logger.error(f"❌ Unexpected Redis error: {e}")
                self._client = None
                return

            except Exception as e:
                # Truly unexpected errors (e.g. SSL misconfiguration)
                logger.error(
                    f"❌ Unexpected error connecting to Redis: {type(e).__name__}: {e}"
                )
                self._client = None
                return

    async def _create_connection(
        self,
        redis_url: str,
        use_ssl: bool,
        settings,
    ) -> aioredis.Redis:
        """
        Create the Redis connection using redis.asyncio.from_url().

        Separated from connect() to keep retry logic clean and to make
        connection parameter tuning obvious.
        """
        # Build SSL kwargs only when SSL is required
        ssl_kwargs = {}
        if use_ssl:
            # Create a proper SSL context for cloud Redis providers
            ssl_context = ssl_module.create_default_context()
            # Most cloud providers (Upstash, Redis Labs) use valid certs,
            # so we keep CERT_REQUIRED for security. If you encounter
            # cert validation issues with a private CA, consider adding
            # ssl_context.load_verify_locations("path/to/ca-cert.pem")
            ssl_kwargs["ssl"] = ssl_context

        return aioredis.from_url(
            redis_url,
            encoding="utf-8",
            decode_responses=True,           # Auto-decode bytes → str
            max_connections=settings.redis_pool_size,
            socket_connect_timeout=settings.redis_connect_timeout,
            socket_timeout=settings.redis_socket_timeout,
            retry_on_timeout=True,           # Auto-retry individual commands on timeout
            health_check_interval=30,        # Keep pool connections alive
            **ssl_kwargs,
        )

    async def disconnect(self) -> None:
        """
        Gracefully close the Redis connection pool.

        Called during FastAPI shutdown. Safe to call multiple times.
        """
        if self._client:
            try:
                await self._client.aclose()
                logger.info("🔌 Redis disconnected gracefully.")
            except Exception as e:
                logger.error(f"Error disconnecting from Redis: {e}")
            finally:
                self._client = None

    # ── Accessors ─────────────────────────────────────

    @property
    def client(self) -> Optional[aioredis.Redis]:
        """
        Get the active Redis client instance.

        Returns:
            The aioredis.Redis instance, or None if connection failed/unavailable.
        """
        return self._client

    @property
    def is_connected(self) -> bool:
        """Check if the Redis client is currently configured and available."""
        return self._client is not None


# ── Module-Level Singleton & Helpers ──────────────────

# Global singleton instance — initialized once, shared across the app.
# Lifecycle managed by FastAPI lifespan events in main.py.
redis_client = RedisClient()


async def connect_redis() -> None:
    """
    Module-level helper to connect the global Redis client.
    Alias for redis_client.connect() for cleaner imports.
    """
    await redis_client.connect()


async def close_redis() -> None:
    """
    Module-level helper to disconnect the global Redis client.
    Alias for redis_client.disconnect() for cleaner imports.
    """
    await redis_client.disconnect()


async def get_redis() -> Optional[aioredis.Redis]:
    """
    FastAPI dependency to inject the Redis client into route handlers.

    Usage:
        @app.get("/example")
        async def example(redis: aioredis.Redis = Depends(get_redis)):
            if redis:
                await redis.get("key")

    Returns:
        The active aioredis.Redis client, or None if unavailable.
    """
    return redis_client.client
