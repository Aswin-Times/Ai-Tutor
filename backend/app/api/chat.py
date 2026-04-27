# ============================================
# EduNex AI Tutor — Chat API Routes
# ============================================
# Handles chat messaging with streaming support,
# session management, and history retrieval.

import uuid
import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
import redis.asyncio as aioredis
from loguru import logger

from app.db.mongodb import get_db
from app.db.redis import get_redis
from app.schemas.chat_schema import (
    ChatRequest,
    ChatResponse,
    ChatHistoryResponse,
    ChatSessionSummary,
    MessageResponse,
)
from app.services.ai_service import ai_service
from app.services.interest_service import detect_interest_from_message
from app.services.memory_service import MemoryService

router = APIRouter(prefix="/chat", tags=["Chat"])


# ── Helper: Build MemoryService ────────────────────────────

def _get_memory(db: AsyncIOMotorDatabase, redis: Optional[aioredis.Redis]) -> MemoryService:
    return MemoryService(db=db, redis=redis)


# ── POST /chat — Send a message (non-streaming) ───────────

@router.post("", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    redis: Optional[aioredis.Redis] = Depends(get_redis),
):
    """
    Send a chat message and receive a complete AI response.
    For streaming, use POST /chat/stream instead.
    """
    memory = _get_memory(db, redis)
    session_id = request.session_id or str(uuid.uuid4())

    # 1. Detect interest
    user_doc = await db["users"].find_one({"user_id": request.user_id})
    user_interests = user_doc.get("interests", []) if user_doc else []
    user_name = user_doc.get("name") if user_doc else None
    learning_style = user_doc.get("learning_style") if user_doc else None

    detected = request.interest or detect_interest_from_message(
        request.message, user_interests
    )

    # 2. Fetch conversation history from memory
    history = await memory.get_short_term_history(request.user_id, session_id)

    # 3. Generate AI response
    result = await ai_service.generate_response(
        message=request.message,
        history=history,
        interest=detected,
        user_name=user_name,
        learning_style=learning_style,
    )

    # 4. Persist both messages to memory
    await memory.save_to_short_term(request.user_id, session_id, "user", request.message)
    await memory.save_to_short_term(
        request.user_id, session_id, "assistant", result["content"], detected
    )

    await memory.save_to_long_term(session_id, request.user_id, "user", request.message)
    await memory.save_to_long_term(
        session_id, request.user_id, "assistant", result["content"], detected
    )

    # 5. Update user stats
    if user_doc:
        await db["users"].update_one(
            {"user_id": request.user_id},
            {"$inc": {"stats.total_messages": 1}},
        )

    logger.info(
        f"Chat: user={request.user_id}, session={session_id}, "
        f"interest={detected}, model={result['model']}"
    )

    return ChatResponse(
        session_id=session_id,
        message=MessageResponse(
            role="assistant",
            content=result["content"],
            detected_interest=detected,
            timestamp=__import__("datetime").datetime.utcnow(),
        ),
        suggested_topics=[
            "Explain further with examples",
            "Give me a practice problem",
            "How does this connect to real life?",
        ],
    )


# ── POST /chat/stream — Send a message (streaming) ────────

@router.post("/stream")
async def stream_message(
    request: ChatRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    redis: Optional[aioredis.Redis] = Depends(get_redis),
):
    """
    Send a chat message and receive a streaming AI response.
    Returns Server-Sent Events (SSE) with token chunks.
    """
    memory = _get_memory(db, redis)
    session_id = request.session_id or str(uuid.uuid4())

    # 1. Detect interest
    user_doc = await db["users"].find_one({"user_id": request.user_id})
    user_interests = user_doc.get("interests", []) if user_doc else []
    user_name = user_doc.get("name") if user_doc else None
    learning_style = user_doc.get("learning_style") if user_doc else None

    detected = request.interest or detect_interest_from_message(
        request.message, user_interests
    )

    # 2. Fetch history
    history = await memory.get_short_term_history(request.user_id, session_id)

    # 3. Save user message immediately
    await memory.save_to_short_term(request.user_id, session_id, "user", request.message)
    await memory.save_to_long_term(session_id, request.user_id, "user", request.message)

    # 4. Stream the AI response via SSE
    async def event_generator():
        full_response = ""

        # Send session metadata first
        meta = json.dumps({
            "type": "meta",
            "session_id": session_id,
            "detected_interest": detected,
        })
        yield f"data: {meta}\n\n"

        try:
            async for token in ai_service.generate_stream(
                message=request.message,
                history=history,
                interest=detected,
                user_name=user_name,
                learning_style=learning_style,
            ):
                full_response += token
                chunk = json.dumps({"type": "token", "content": token})
                yield f"data: {chunk}\n\n"

        except Exception as e:
            logger.error(f"Stream error: {e}")
            error = json.dumps({"type": "error", "message": str(e)})
            yield f"data: {error}\n\n"

        # Save the complete assistant response
        await memory.save_to_short_term(
            request.user_id, session_id, "assistant", full_response, detected
        )
        await memory.save_to_long_term(
            session_id, request.user_id, "assistant", full_response, detected
        )

        # Update stats
        if user_doc:
            await db["users"].update_one(
                {"user_id": request.user_id},
                {"$inc": {"stats.total_messages": 1}},
            )

        # Send completion signal
        done = json.dumps({
            "type": "done",
            "session_id": session_id,
            "detected_interest": detected,
        })
        yield f"data: {done}\n\n"

    logger.info(f"Stream started: user={request.user_id}, session={session_id}, interest={detected}")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ── GET /chat/sessions — List user's chat sessions ────────

@router.get("/sessions", response_model=list[ChatSessionSummary])
async def list_sessions(
    user_id: str = Query(..., min_length=1),
    limit: int = Query(default=20, ge=1, le=50),
    db: AsyncIOMotorDatabase = Depends(get_db),
    redis: Optional[aioredis.Redis] = Depends(get_redis),
):
    """Get all chat sessions for a user (sidebar data)."""
    memory = _get_memory(db, redis)
    sessions = await memory.get_user_sessions(user_id, limit)
    return sessions


# ── GET /chat/history/{session_id} — Get session messages ──

@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
async def get_history(
    session_id: str,
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncIOMotorDatabase = Depends(get_db),
    redis: Optional[aioredis.Redis] = Depends(get_redis),
):
    """Get full message history for a specific session."""
    memory = _get_memory(db, redis)
    messages = await memory.get_long_term_history(session_id, limit)

    return ChatHistoryResponse(
        session_id=session_id,
        messages=[
            MessageResponse(
                role=m["role"],
                content=m["content"],
                detected_interest=m.get("detected_interest"),
                timestamp=m.get("timestamp", __import__("datetime").datetime.utcnow()),
            )
            for m in messages
        ],
        total=len(messages),
    )


# ── DELETE /chat/session/{session_id} — Delete a session ───

@router.delete("/session/{session_id}")
async def delete_session(
    session_id: str,
    user_id: str = Query(..., min_length=1),
    db: AsyncIOMotorDatabase = Depends(get_db),
    redis: Optional[aioredis.Redis] = Depends(get_redis),
):
    """Delete a specific chat session."""
    memory = _get_memory(db, redis)
    deleted = await memory.delete_session(session_id, user_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")

    return {"status": "deleted", "session_id": session_id}
