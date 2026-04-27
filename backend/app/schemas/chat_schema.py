# ============================================
# EduNex AI Tutor — Chat Pydantic Schemas
# ============================================
# Request/response models for the Chat API.

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ── Requests ───────────────────────────────────────────────

class ChatRequest(BaseModel):
    """Incoming chat message from the frontend."""
    user_id: str = Field(..., min_length=1, description="Unique user identifier")
    message: str = Field(..., min_length=1, max_length=4000, description="User message content")
    session_id: Optional[str] = Field(default=None, description="Existing session ID (None = new session)")
    interest: Optional[str] = Field(default=None, description="User's primary interest for this message")

    model_config = {"json_schema_extra": {
        "example": {
            "user_id": "user-001",
            "message": "Explain how recursion works",
            "session_id": "sess-abc123",
            "interest": "gaming",
        }
    }}


class ChatHistoryRequest(BaseModel):
    """Request to fetch chat history."""
    user_id: str = Field(..., min_length=1)
    session_id: Optional[str] = Field(default=None, description="Specific session or None for all sessions")
    limit: int = Field(default=50, ge=1, le=200)


# ── Responses ──────────────────────────────────────────────

class MessageResponse(BaseModel):
    """A single chat message in a response."""
    role: str
    content: str
    detected_interest: Optional[str] = None
    timestamp: datetime


class ChatResponse(BaseModel):
    """Non-streaming chat response."""
    session_id: str
    message: MessageResponse
    suggested_topics: list[str] = []


class ChatSessionSummary(BaseModel):
    """Summary of a chat session for the sidebar."""
    session_id: str
    title: str
    message_count: int
    last_message_preview: str = ""
    detected_interests: list[str] = []
    created_at: datetime
    updated_at: datetime


class ChatHistoryResponse(BaseModel):
    """Response containing chat history."""
    session_id: str
    messages: list[MessageResponse]
    total: int
