# ============================================
# EduNex AI Tutor — Chat MongoDB Model
# ============================================
# Defines the Chat session / message structure for MongoDB long-term storage.

from datetime import datetime


def create_chat_session_document(
    session_id: str,
    user_id: str,
    title: str = "New Conversation",
) -> dict:
    """Create a new chat session document for MongoDB."""
    return {
        "session_id": session_id,
        "user_id": user_id,
        "title": title,
        "messages": [],
        "detected_interests": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


def create_message_entry(
    role: str,
    content: str,
    detected_interest: str | None = None,
) -> dict:
    """Create a message sub-document."""
    entry = {
        "role": role,
        "content": content,
        "timestamp": datetime.utcnow(),
    }
    if detected_interest:
        entry["detected_interest"] = detected_interest
    return entry


# ── Index definitions ──────────────────────────────────────
CHAT_INDEXES = [
    {"keys": [("session_id", 1)], "unique": True},
    {"keys": [("user_id", 1)]},
    {"keys": [("created_at", -1)]},
]
