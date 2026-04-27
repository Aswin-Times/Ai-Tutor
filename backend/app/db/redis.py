# ============================================
# EduNex AI Tutor — Redis Async Connection
# ============================================
# Production-ready async Redis client for short-term chat memory and caching.
# Supports URL-based connections to Cloud Redis (e.g., Redis Labs, Upstash).

import asyncio
import ssl
from typing import Optional

import redis.asyncio as aioredis
from redis.exceptions import AuthenticationError, ConnectionError, TimeoutError
from loguru import logger

from app.core.config import get_settings


class RedisClient:
    """
    Async Redis connection manager designed for production stability.
    Supports secure cloud connections via URL with connection pooling
    and robust error handling.
    """

    def __init__(self) -> None:
        self._client: Optional[aioredis.Redis] = None

    async def connect(self) -> None:
        """
        Establish an asynchronous connection to Redis using the provided REDIS_URL.
        Validates the connection via PING.
        """
        settings = get_settings()
        redis_url = settings.redis_url

        if not redis_url:
            logger.warning("⚠️ REDIS_URL is not configured. Running without Redis cache.")
            return

        # Determine if SSL is needed based on the URL scheme
        # Cloud Redis often requires SSL (rediss:// instead of redis://)
        use_ssl = redis_url.startswith("rediss://")

        # Configure SSL context if necessary
        ssl_kwargs = {}
        if use_ssl:
            ssl_context = ssl.create_default_context()
            # For cloud providers, we often need to relax cert validation 
            # if they use custom CAs, but default is secure.
            ssl_kwargs["ssl_cert_reqs"] = ssl.CERT_REQUIRED
            
            # Note: aioredis from_url passes these kwargs directly to the connection pool
            # We don't strictly need to pass the context if we just use rediss:// 
            # as aioredis handles it, but this allows explicit control.

        logger.info(f"Connecting to Redis at {redis_url.split('@')[-1] if '@' in redis_url else redis_url.split('://')[-1].split(':')[0]}...")

        try:
            # Initialize the connection pool via URL
            self._client = aioredis.from_url(
                redis_url,
                encoding="utf-8",
                decode_responses=True,      # Automatically decode responses from bytes to strings
                max_connections=50,         # Production-level pool size
                socket_connect_timeout=5.0, # Timeout for establishing connection
                socket_timeout=5.0,         # Timeout for commands
                retry_on_timeout=True,      # Automatically retry once on timeout
                health_check_interval=30,   # Keep connections alive in the pool
                **ssl_kwargs
            )

            # Validate the connection with a PING command
            await self._client.ping()
            logger.info("✅ Redis connected successfully and validated (PING).")

        except AuthenticationError as e:
            logger.error(f"❌ Redis authentication failed. Check your REDIS_URL password: {e}")
            self._client = None
            
        except (ConnectionError, TimeoutError) as e:
            logger.warning(f"⚠️ Redis connection failed or timed out: {e}. Running in degraded mode without cache.")
            self._client = None
            
        except Exception as e:
            logger.error(f"❌ Unexpected error connecting to Redis: {e}")
            self._client = None

    async def disconnect(self) -> None:
        """
        Gracefully close the Redis connection pool.
        """
        if self._client:
            try:
                await self._client.aclose() # using aclose() for newer redis-py versions
                logger.info("🔌 Redis disconnected gracefully.")
            except Exception as e:
                logger.error(f"Error disconnecting from Redis: {e}")
            finally:
                self._client = None

    @property
    def client(self) -> Optional[aioredis.Redis]:
        """
        Get the active Redis client.
        
        Returns:
            The aioredis.Redis instance, or None if the connection failed.
        """
        return self._client

    @property
    def is_connected(self) -> bool:
        """
        Check if the Redis client is currently configured and available.
        """
        return self._client is not None


# Global singleton instance
redis_client = RedisClient()


async def get_redis() -> Optional[aioredis.Redis]:
    """
    FastAPI dependency to inject the Redis client into route handlers.
    
    Returns:
        The active aioredis.Redis client, or None if unavailable.
    """
    return redis_client.client
