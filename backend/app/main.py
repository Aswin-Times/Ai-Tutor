# ============================================
# EduNex AI Tutor — FastAPI Application Entry Point
# ============================================
# Production-grade FastAPI app with lifecycle management,
# CORS, health checks, and modular routing.

import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import get_settings
from app.db.mongodb import mongodb
from app.db.redis import redis_client
from app.api.chat import router as chat_router
from app.api.user import router as user_router
from app.api.progress import router as progress_router
from app.models.user_model import USER_INDEXES
from app.models.chat_model import CHAT_INDEXES


# ── Logging Configuration ─────────────────────────────────

def configure_logging() -> None:
    """Set up structured logging with loguru."""
    logger.remove()  # Remove default handler
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )
    logger.add(sys.stderr, format=log_format, level="DEBUG" if get_settings().debug else "INFO")
    logger.add(
        "logs/edunex_{time:YYYY-MM-DD}.log",
        rotation="1 day",
        retention="7 days",
        compression="gz",
        format=log_format,
        level="INFO",
    )


# ── Database Index Setup ──────────────────────────────────

async def ensure_indexes() -> None:
    """Create MongoDB indexes for optimal query performance."""
    if not mongodb.is_connected:
        logger.warning("⚠️ Skipping index creation — MongoDB not connected")
        return

    db = mongodb.db
    try:
        # User indexes
        for idx in USER_INDEXES:
            await db["users"].create_index(
                idx["keys"],
                unique=idx.get("unique", False),
            )

        # Chat indexes
        for idx in CHAT_INDEXES:
            await db["chat_sessions"].create_index(
                idx["keys"],
                unique=idx.get("unique", False),
            )

        # Activity log index
        await db["activity_log"].create_index([("user_id", 1), ("timestamp", -1)])

        logger.info("✅ MongoDB indexes ensured")
    except Exception as e:
        logger.warning(f"⚠️ Index creation warning: {e}")


# ── Application Lifecycle ─────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage startup and shutdown events."""
    configure_logging()
    settings = get_settings()

    logger.info(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"   Model: {settings.groq_model}")
    logger.info(f"   Debug: {settings.debug}")

    # Connect to databases
    await mongodb.connect()
    await redis_client.connect()

    # Ensure indexes
    await ensure_indexes()

    logger.info(f"✅ {settings.app_name} is ready!")
    logger.info(f"   Docs: http://localhost:8000/docs")

    yield  # ← Application runs here

    # Shutdown
    logger.info("🛑 Shutting down...")
    await redis_client.disconnect()
    await mongodb.disconnect()
    logger.info("👋 Goodbye!")


# ── Create FastAPI App ─────────────────────────────────────

def create_app() -> FastAPI:
    """Application factory."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "EduNex AI Tutor — Adaptive Interest-Based Learning Platform.\n\n"
            "An AI orchestration backend that detects user interests, "
            "maintains chat memory, and generates adaptive explanations "
            "using LLaMA via the Groq API."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # ── CORS ───────────────────────────────────────────
    origins = settings.cors_origin_list
    # allow_credentials cannot be True when origins is ["*"]
    use_credentials = "*" not in origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=use_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ────────────────────────────────────────
    app.include_router(chat_router, prefix="/api")
    app.include_router(user_router, prefix="/api")
    app.include_router(progress_router, prefix="/api")

    # ── Health Check ───────────────────────────────────
    @app.get("/health", tags=["System"])
    async def health_check():
        """Check the health of all service dependencies."""
        mongo_status = "disconnected"
        redis_status = "connected" if redis_client.is_connected else "disconnected"

        if mongodb.is_connected:
            try:
                await mongodb.client.admin.command("ping")
                mongo_status = "connected"
            except Exception:
                mongo_status = "error"

        if redis_client.is_connected:
            try:
                await redis_client.client.ping()
            except Exception:
                redis_status = "error"

        return {
            "status": "healthy" if mongo_status == "connected" else "degraded",
            "version": settings.app_version,
            "mongodb": mongo_status,
            "redis": redis_status,
            "ai_model": settings.groq_model,
        }

    # ── Root ───────────────────────────────────────────
    @app.get("/", tags=["System"])
    async def root():
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
            "health": "/health",
        }

    return app


# ── App Instance ──────────────────────────────────────────

app = create_app()
