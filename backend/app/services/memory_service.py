# ============================================
# EduNex AI Tutor — Memory Service
# ============================================
# Manages short-term chat memory in Redis and
# long-term persistence in MongoDB.

import json
from typing import Optional

from loguru import logger
from motor.motor_asyncio import AsyncIOMotorDatabase
import redis.asyncio as aioredis

from app.core.config import get_settings
from app.models.chat_model import create_message_entry


class MemoryService:
    """
    Dual-layer memory system:
    - Redis: fast short-term memory (last N messages, TTL-based)
    - MongoDB: permanent long-term storage (full history)
    """

    def __init__(self, db: AsyncIOMotorDatabase, redis: Optional[aioredis.Redis]):
        self._db = db
        self._redis = redis
        self._settings = get_settings()

    # ── Redis Keys ─────────────────────────────────────────

    def _memory_key(self, user_id: str, session_id: str) -> str:
        """Redis key for a user's session memory."""
        return f"chat:{user_id}:{session_id}"

    # ── Short-Term Memory (Redis) ──────────────────────────

    async def get_short_term_history(
        self, user_id: str, session_id: str
    ) -> list[dict]:
        """
        Fetch recent messages from Redis.
        Returns empty list if Redis is unavailable.
        """
        if not self._redis:
            return await self._fallback_history_from_mongo(user_id, session_id)

        try:
            key = self._memory_key(user_id, session_id)
            raw = await self._redis.get(key)
            if raw:
                messages = json.loads(raw)
                logger.debug(f"Redis hit: {len(messages)} messages for {key}")
                return messages
            else:
                # Cache miss — load from MongoDB and populate cache
                logger.debug(f"Redis miss for {key}, loading from MongoDB")
                return await self._populate_cache_from_mongo(user_id, session_id)
        except Exception as e:
            logger.warning(f"Redis read error: {e}. Falling back to MongoDB.")
            return await self._fallback_history_from_mongo(user_id, session_id)

    async def save_to_short_term(
        self,
        user_id: str,
        session_id: str,
        role: str,
        content: str,
        detected_interest: Optional[str] = None,
    ) -> None:
        """
        Append a message to Redis short-term memory.
        Trims to max_memory_messages and refreshes TTL.
        """
        if not self._redis:
            return

        try:
            key = self._memory_key(user_id, session_id)
            # Get existing messages
            raw = await self._redis.get(key)
            messages = json.loads(raw) if raw else []

            # Append new message
            entry = {"role": role, "content": content}
            if detected_interest:
                entry["detected_interest"] = detected_interest
            messages.append(entry)

            # Trim to max size (keep the most recent)
            max_msgs = self._settings.max_memory_messages
            if len(messages) > max_msgs:
                messages = messages[-max_msgs:]

            # Save back with TTL
            await self._redis.set(
                key,
                json.dumps(messages),
                ex=self._settings.chat_memory_ttl,
            )
            logger.debug(f"Redis saved: {len(messages)} messages for {key}")
        except Exception as e:
            logger.warning(f"Redis write error: {e}")

    async def clear_short_term(self, user_id: str, session_id: str) -> None:
        """Remove a session's short-term memory from Redis."""
        if not self._redis:
            return
        try:
            key = self._memory_key(user_id, session_id)
            await self._redis.delete(key)
        except Exception as e:
            logger.warning(f"Redis delete error: {e}")

    # ── Long-Term Memory (MongoDB) ─────────────────────────

    async def save_to_long_term(
        self,
        session_id: str,
        user_id: str,
        role: str,
        content: str,
        detected_interest: Optional[str] = None,
    ) -> None:
        """
        Persist a message to MongoDB for permanent storage.
        Creates the session document if it doesn't exist.
        """
        collection = self._db["chat_sessions"]
        message_entry = create_message_entry(role, content, detected_interest)

        # Upsert: create session if not exists, append message
        result = await collection.update_one(
            {"session_id": session_id},
            {
                "$push": {"messages": message_entry},
                "$set": {"updated_at": message_entry["timestamp"]},
                "$setOnInsert": {
                    "session_id": session_id,
                    "user_id": user_id,
                    "title": content[:60] + ("..." if len(content) > 60 else ""),
                    "created_at": message_entry["timestamp"],
                },
                "$addToSet": {"detected_interests": detected_interest} if detected_interest else {},
            },
            upsert=True,
        )
        logger.debug(
            f"MongoDB save: session={session_id}, matched={result.matched_count}, "
            f"modified={result.modified_count}, upserted={result.upserted_id is not None}"
        )

    async def get_long_term_history(
        self, session_id: str, limit: int = 50
    ) -> list[dict]:
        """Fetch full message history from MongoDB for a session."""
        collection = self._db["chat_sessions"]
        session = await collection.find_one(
            {"session_id": session_id},
            {"messages": {"$slice": -limit}},
        )
        if session and "messages" in session:
            return [
                {
                    "role": m["role"],
                    "content": m["content"],
                    "detected_interest": m.get("detected_interest"),
                }
                for m in session["messages"]
            ]
        return []

    async def get_user_sessions(
        self, user_id: str, limit: int = 20
    ) -> list[dict]:
        """Get all chat sessions for a user (for sidebar)."""
        collection = self._db["chat_sessions"]
        cursor = collection.find(
            {"user_id": user_id},
            {
                "session_id": 1,
                "title": 1,
                "detected_interests": 1,
                "created_at": 1,
                "updated_at": 1,
                "messages": {"$slice": -1},  # Only last message for preview
            },
        ).sort("updated_at", -1).limit(limit)

        sessions = []
        async for doc in cursor:
            last_msg = doc.get("messages", [{}])
            preview = last_msg[-1].get("content", "")[:80] if last_msg else ""
            sessions.append({
                "session_id": doc["session_id"],
                "title": doc.get("title", "Untitled"),
                "message_count": len(doc.get("messages", [])),
                "last_message_preview": preview,
                "detected_interests": doc.get("detected_interests", []),
                "created_at": doc.get("created_at"),
                "updated_at": doc.get("updated_at"),
            })
        return sessions

    async def delete_session(self, session_id: str, user_id: str) -> bool:
        """Delete a chat session from both Redis and MongoDB."""
        # Remove from MongoDB
        collection = self._db["chat_sessions"]
        result = await collection.delete_one(
            {"session_id": session_id, "user_id": user_id}
        )

        # Remove from Redis
        await self.clear_short_term(user_id, session_id)

        return result.deleted_count > 0

    # ── Internal Helpers ───────────────────────────────────

    async def _fallback_history_from_mongo(
        self, user_id: str, session_id: str
    ) -> list[dict]:
        """Load history from MongoDB when Redis is unavailable."""
        max_msgs = self._settings.max_memory_messages
        return await self.get_long_term_history(session_id, limit=max_msgs)

    async def _populate_cache_from_mongo(
        self, user_id: str, session_id: str
    ) -> list[dict]:
        """Load history from MongoDB into Redis cache."""
        messages = await self._fallback_history_from_mongo(user_id, session_id)
        if messages and self._redis:
            try:
                key = self._memory_key(user_id, session_id)
                await self._redis.set(
                    key,
                    json.dumps(messages),
                    ex=self._settings.chat_memory_ttl,
                )
            except Exception as e:
                logger.warning(f"Failed to populate Redis cache: {e}")
        return messages
