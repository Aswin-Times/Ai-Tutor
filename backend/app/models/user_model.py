# ============================================
# EduNex AI Tutor — User MongoDB Model
# ============================================
# Defines the User document structure for MongoDB.

from datetime import datetime
from typing import Optional


def create_user_document(
    user_id: str,
    name: str,
    email: str,
    interests: list[str] | None = None,
    learning_style: str = "visual",
) -> dict:
    """Create a new user document for MongoDB insertion."""
    return {
        "user_id": user_id,
        "name": name,
        "email": email,
        "interests": interests or [],
        "learning_style": learning_style,
        "stats": {
            "total_messages": 0,
            "total_topics": 0,
            "streak_days": 0,
            "total_study_minutes": 0,
        },
        "topics_learned": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


def create_topic_entry(
    name: str,
    category: str,
    interest: str,
    mastery_level: int = 0,
) -> dict:
    """Create a learned-topic sub-document."""
    return {
        "name": name,
        "category": category,
        "interest": interest,
        "mastery_level": mastery_level,
        "last_studied": datetime.utcnow(),
    }


# ── Index definitions (applied at startup) ─────────────────
USER_INDEXES = [
    {"keys": [("user_id", 1)], "unique": True},
    {"keys": [("email", 1)], "unique": True},
]
