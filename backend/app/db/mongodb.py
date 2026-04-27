# ============================================
# EduNex AI Tutor — MongoDB Async Connection
# ============================================
# Uses Motor (async pymongo driver) with connection pooling
# and lifecycle management via FastAPI events.
# Gracefully handles missing MongoDB — server boots in degraded mode.

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from loguru import logger

from app.core.config import get_settings


class MongoDB:
    """Async MongoDB connection manager with connection pooling."""

    def __init__(self) -> None:
        self._client: AsyncIOMotorClient | None = None
        self._db: AsyncIOMotorDatabase | None = None

    async def connect(self) -> None:
        """Establish connection to MongoDB. Graceful on failure."""
        settings = get_settings()
        try:
            self._client = AsyncIOMotorClient(
                settings.mongodb_url,
                maxPoolSize=50,
                minPoolSize=10,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
            )
            # Verify connection is alive
            await self._client.admin.command("ping")
            self._db = self._client[settings.mongodb_db_name]
            logger.info(f"✅ MongoDB connected — database: {settings.mongodb_db_name}")
        except Exception as e:
            logger.warning(f"⚠️ MongoDB connection failed: {e}. Running without database.")
            self._client = None
            self._db = None

    async def disconnect(self) -> None:
        """Close MongoDB connection."""
        if self._client:
            self._client.close()
            logger.info("🔌 MongoDB disconnected")

    @property
    def is_connected(self) -> bool:
        """Check if MongoDB is available."""
        return self._db is not None

    @property
    def db(self) -> AsyncIOMotorDatabase:
        """Get the database instance."""
        if self._db is None:
            raise RuntimeError("MongoDB is not connected. Ensure MongoDB is running.")
        return self._db

    @property
    def client(self) -> AsyncIOMotorClient:
        """Get the raw client instance."""
        if self._client is None:
            raise RuntimeError("MongoDB is not connected. Ensure MongoDB is running.")
        return self._client


# Global singleton
mongodb = MongoDB()


async def get_db() -> AsyncIOMotorDatabase:
    """FastAPI dependency to get the database instance."""
    return mongodb.db
