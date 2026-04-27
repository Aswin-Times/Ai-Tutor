# ============================================
# EduNex AI Tutor — Progress API Routes
# ============================================
# Learning progress tracking, stats, and analytics.

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from loguru import logger

from app.db.mongodb import get_db
from app.schemas.user_schema import (
    LearningProgressResponse,
    UserStats,
    WeeklyActivity,
    InterestStat,
    TopicLearned,
)

router = APIRouter(prefix="/progress", tags=["Progress"])


# ── GET /progress/{user_id} — Full learning dashboard ─────

@router.get("/{user_id}", response_model=LearningProgressResponse)
async def get_progress(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get comprehensive learning progress for a user."""
    user = await db["users"].find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get user stats
    stats_data = user.get("stats", {})
    stats = UserStats(**stats_data)

    # Compute weekly activity from chat sessions
    weekly_activity = await _compute_weekly_activity(db, user_id)

    # Compute interest distribution
    top_interests = await _compute_interest_stats(db, user_id)

    # Get topics learned
    topics = [
        TopicLearned(**t) for t in user.get("topics_learned", [])
    ]

    return LearningProgressResponse(
        user_id=user_id,
        stats=stats,
        weekly_activity=weekly_activity,
        top_interests=top_interests,
        topics_learned=topics,
    )


# ── POST /progress/{user_id}/topic — Record a learned topic

@router.post("/{user_id}/topic")
async def record_topic(
    user_id: str,
    name: str = Query(..., min_length=1),
    category: str = Query(default="General"),
    interest: str = Query(default="general"),
    mastery_level: int = Query(default=50, ge=0, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Record that a user has studied a topic."""
    topic_entry = {
        "name": name,
        "category": category,
        "interest": interest,
        "mastery_level": mastery_level,
        "last_studied": datetime.utcnow(),
    }

    # Check if topic already exists (update mastery) or add new
    result = await db["users"].update_one(
        {"user_id": user_id, "topics_learned.name": name},
        {
            "$set": {
                "topics_learned.$.mastery_level": mastery_level,
                "topics_learned.$.last_studied": datetime.utcnow(),
            }
        },
    )

    if result.matched_count == 0:
        # Topic doesn't exist yet — add it
        result = await db["users"].update_one(
            {"user_id": user_id},
            {
                "$push": {"topics_learned": topic_entry},
                "$inc": {"stats.total_topics": 1},
            },
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

    logger.info(f"Topic recorded: user={user_id}, topic={name}, mastery={mastery_level}")
    return {"status": "recorded", "topic": name, "mastery_level": mastery_level}


# ── POST /progress/{user_id}/study-time — Log study time ──

@router.post("/{user_id}/study-time")
async def log_study_time(
    user_id: str,
    minutes: int = Query(..., ge=1, le=480),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Log study time in minutes for a user."""
    result = await db["users"].update_one(
        {"user_id": user_id},
        {"$inc": {"stats.total_study_minutes": minutes}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    # Also log to activity collection for weekly tracking
    await db["activity_log"].insert_one({
        "user_id": user_id,
        "type": "study",
        "minutes": minutes,
        "timestamp": datetime.utcnow(),
    })

    logger.info(f"Study time logged: user={user_id}, minutes={minutes}")
    return {"status": "logged", "minutes": minutes}


# ── GET /progress/{user_id}/streak — Get current streak ───

@router.get("/{user_id}/streak")
async def get_streak(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Calculate the user's current daily study streak."""
    user = await db["users"].find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    streak = await _compute_streak(db, user_id)

    # Update stored streak
    await db["users"].update_one(
        {"user_id": user_id},
        {"$set": {"stats.streak_days": streak}},
    )

    return {"user_id": user_id, "streak_days": streak}


# ── Internal Helpers ───────────────────────────────────────

async def _compute_weekly_activity(
    db: AsyncIOMotorDatabase, user_id: str
) -> list[WeeklyActivity]:
    """Compute daily message counts and study time for the past 7 days."""
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    today = datetime.utcnow().date()
    result = []

    for i in range(6, -1, -1):
        day_date = today - timedelta(days=i)
        day_start = datetime.combine(day_date, datetime.min.time())
        day_end = datetime.combine(day_date, datetime.max.time())

        # Count messages from chat sessions
        msg_count = await db["chat_sessions"].count_documents({
            "user_id": user_id,
            "updated_at": {"$gte": day_start, "$lte": day_end},
        })

        # Sum study minutes from activity log
        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "type": "study",
                    "timestamp": {"$gte": day_start, "$lte": day_end},
                }
            },
            {"$group": {"_id": None, "total": {"$sum": "$minutes"}}},
        ]
        agg = await db["activity_log"].aggregate(pipeline).to_list(1)
        minutes = agg[0]["total"] if agg else 0

        result.append(WeeklyActivity(
            day=days[day_date.weekday()],
            messages=msg_count,
            minutes=minutes,
        ))

    return result


async def _compute_interest_stats(
    db: AsyncIOMotorDatabase, user_id: str
) -> list[InterestStat]:
    """Compute topic count distribution across interests."""
    user = await db["users"].find_one({"user_id": user_id})
    if not user:
        return []

    topics = user.get("topics_learned", [])
    if not topics:
        return []

    # Count topics per interest
    interest_counts: dict[str, int] = {}
    for topic in topics:
        interest = topic.get("interest", "general")
        interest_counts[interest] = interest_counts.get(interest, 0) + 1

    total = sum(interest_counts.values())

    return sorted(
        [
            InterestStat(
                interest=interest,
                topic_count=count,
                percentage=round(count / total * 100, 1) if total > 0 else 0,
            )
            for interest, count in interest_counts.items()
        ],
        key=lambda x: x.topic_count,
        reverse=True,
    )


async def _compute_streak(db: AsyncIOMotorDatabase, user_id: str) -> int:
    """Calculate consecutive days with activity."""
    today = datetime.utcnow().date()
    streak = 0

    for i in range(365):  # Max 1 year lookback
        day = today - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())

        # Check if there was any activity on this day
        has_chat = await db["chat_sessions"].count_documents({
            "user_id": user_id,
            "updated_at": {"$gte": day_start, "$lte": day_end},
        })
        has_study = await db["activity_log"].count_documents({
            "user_id": user_id,
            "timestamp": {"$gte": day_start, "$lte": day_end},
        })

        if has_chat > 0 or has_study > 0:
            streak += 1
        else:
            # Allow skipping today if no activity yet
            if i == 0:
                continue
            break

    return streak
