# ============================================
# EduNex AI Tutor — User Pydantic Schemas
# ============================================
# Request/response models for the User & Progress APIs.

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr


# ── Requests ───────────────────────────────────────────────

class UserCreateRequest(BaseModel):
    """Create a new user account."""
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=5, max_length=200)
    interests: list[str] = Field(default_factory=list, max_length=10)
    learning_style: str = Field(default="visual")

    model_config = {"json_schema_extra": {
        "example": {
            "name": "Aswin R",
            "email": "aswin@edunex.ai",
            "interests": ["gaming", "coding", "music"],
            "learning_style": "visual",
        }
    }}


class UserUpdateRequest(BaseModel):
    """Update user profile fields."""
    name: Optional[str] = Field(default=None, max_length=100)
    email: Optional[str] = Field(default=None, max_length=200)
    interests: Optional[list[str]] = Field(default=None, max_length=10)
    learning_style: Optional[str] = None


class InterestUpdateRequest(BaseModel):
    """Update user interests specifically."""
    interests: list[str] = Field(..., min_length=1, max_length=10)


# ── Responses ──────────────────────────────────────────────

class UserStats(BaseModel):
    """User learning statistics."""
    total_messages: int = 0
    total_topics: int = 0
    streak_days: int = 0
    total_study_minutes: int = 0


class TopicLearned(BaseModel):
    """A topic the user has studied."""
    name: str
    category: str
    interest: str
    mastery_level: int = Field(ge=0, le=100)
    last_studied: datetime


class UserProfileResponse(BaseModel):
    """Full user profile response."""
    user_id: str
    name: str
    email: str
    interests: list[str]
    learning_style: str
    stats: UserStats
    topics_learned: list[TopicLearned] = []
    created_at: datetime


class WeeklyActivity(BaseModel):
    """Daily activity breakdown."""
    day: str
    messages: int
    minutes: int


class InterestStat(BaseModel):
    """Stats per interest category."""
    interest: str
    topic_count: int
    percentage: float


class LearningProgressResponse(BaseModel):
    """Full learning progress dashboard data."""
    user_id: str
    stats: UserStats
    weekly_activity: list[WeeklyActivity]
    top_interests: list[InterestStat]
    topics_learned: list[TopicLearned]


class HealthResponse(BaseModel):
    """API health check response."""
    status: str
    version: str
    mongodb: str
    redis: str
