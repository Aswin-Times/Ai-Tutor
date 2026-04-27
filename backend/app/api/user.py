# ============================================
# EduNex AI Tutor — User API Routes
# ============================================
# User registration, profile management, and interest updates.

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from loguru import logger

from app.db.mongodb import get_db
from app.models.user_model import create_user_document
from app.schemas.user_schema import (
    UserCreateRequest,
    UserUpdateRequest,
    InterestUpdateRequest,
    UserProfileResponse,
    UserStats,
    TopicLearned,
)

router = APIRouter(prefix="/user", tags=["User"])


# ── POST /user — Create a new user ────────────────────────

@router.post("", response_model=UserProfileResponse, status_code=201)
async def create_user(
    request: UserCreateRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Register a new user with initial interests."""
    # Check if email already exists
    existing = await db["users"].find_one({"email": request.email})
    if existing:
        raise HTTPException(
            status_code=409,
            detail="A user with this email already exists.",
        )

    user_id = str(uuid.uuid4())
    doc = create_user_document(
        user_id=user_id,
        name=request.name,
        email=request.email,
        interests=request.interests,
        learning_style=request.learning_style,
    )

    await db["users"].insert_one(doc)
    logger.info(f"User created: id={user_id}, name={request.name}")

    return UserProfileResponse(
        user_id=user_id,
        name=request.name,
        email=request.email,
        interests=request.interests,
        learning_style=request.learning_style,
        stats=UserStats(),
        topics_learned=[],
        created_at=doc["created_at"],
    )


# ── GET /user/{user_id} — Get user profile ────────────────

@router.get("/{user_id}", response_model=UserProfileResponse)
async def get_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Fetch a user's full profile."""
    doc = await db["users"].find_one({"user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")

    return UserProfileResponse(
        user_id=doc["user_id"],
        name=doc["name"],
        email=doc["email"],
        interests=doc.get("interests", []),
        learning_style=doc.get("learning_style", "visual"),
        stats=UserStats(**doc.get("stats", {})),
        topics_learned=[
            TopicLearned(**t) for t in doc.get("topics_learned", [])
        ],
        created_at=doc["created_at"],
    )


# ── PATCH /user/{user_id} — Update user profile ───────────

@router.patch("/{user_id}", response_model=UserProfileResponse)
async def update_user(
    user_id: str,
    request: UserUpdateRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update user profile fields (name, email, learning style, interests)."""
    # Build update dict with only provided fields
    update_data: dict = {}
    if request.name is not None:
        update_data["name"] = request.name
    if request.email is not None:
        update_data["email"] = request.email
    if request.interests is not None:
        update_data["interests"] = request.interests
    if request.learning_style is not None:
        update_data["learning_style"] = request.learning_style

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_data["updated_at"] = datetime.utcnow()

    result = await db["users"].update_one(
        {"user_id": user_id},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    logger.info(f"User updated: id={user_id}, fields={list(update_data.keys())}")

    # Return updated profile
    return await get_user(user_id, db)


# ── PUT /user/{user_id}/interests — Update interests ──────

@router.put("/{user_id}/interests")
async def update_interests(
    user_id: str,
    request: InterestUpdateRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Replace a user's interest list entirely."""
    result = await db["users"].update_one(
        {"user_id": user_id},
        {
            "$set": {
                "interests": request.interests,
                "updated_at": datetime.utcnow(),
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    logger.info(f"Interests updated: user={user_id}, interests={request.interests}")
    return {"status": "updated", "interests": request.interests}


# ── GET /user/by-email — Lookup user by email ─────────────

@router.get("/by-email/lookup", response_model=UserProfileResponse)
async def get_user_by_email(
    email: str = Query(..., min_length=3),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Find a user by their email address."""
    doc = await db["users"].find_one({"email": email})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")

    return UserProfileResponse(
        user_id=doc["user_id"],
        name=doc["name"],
        email=doc["email"],
        interests=doc.get("interests", []),
        learning_style=doc.get("learning_style", "visual"),
        stats=UserStats(**doc.get("stats", {})),
        topics_learned=[
            TopicLearned(**t) for t in doc.get("topics_learned", [])
        ],
        created_at=doc["created_at"],
    )
