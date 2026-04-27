# ============================================
# EduNex AI Tutor — Groq AI Service
# ============================================
# Handles all interactions with the Groq LLaMA API,
# including streaming responses and retry logic.

import asyncio
from typing import AsyncGenerator, Optional

from groq import Groq, APIError, RateLimitError, APIConnectionError
from loguru import logger

from app.core.config import get_settings
from app.utils.prompt_builder import build_system_prompt, build_chat_messages


# ── Retry configuration ───────────────────────────────────
MAX_RETRIES = 3
RETRY_DELAYS = [1.0, 2.0, 4.0]  # Exponential backoff


class AIService:
    """
    Groq LLaMA AI service with streaming support,
    retry logic, and adaptive prompt injection.
    """

    def __init__(self) -> None:
        settings = get_settings()
        if not settings.groq_api_key or settings.groq_api_key.startswith("gsk_your"):
            logger.warning("⚠️ GROQ_API_KEY is not set — AI responses will fail.")
            self._client = None
        else:
            self._client = Groq(api_key=settings.groq_api_key)
        self._model = settings.groq_model

    @property
    def is_available(self) -> bool:
        """Check if the AI service is configured and available."""
        return self._client is not None

    # ── Non-Streaming Completion ───────────────────────────

    async def generate_response(
        self,
        message: str,
        history: list[dict],
        interest: Optional[str] = None,
        user_name: Optional[str] = None,
        learning_style: Optional[str] = None,
    ) -> dict:
        """
        Generate a complete (non-streaming) AI response.

        Returns:
            dict with 'content' and 'model' keys.
        """
        if not self._client:
            return {
                "content": self._fallback_response(message, interest),
                "model": "fallback",
            }

        system_prompt = build_system_prompt(interest, user_name, learning_style)
        messages = build_chat_messages(system_prompt, history, message)

        for attempt in range(MAX_RETRIES):
            try:
                # Run synchronous Groq call in thread pool to avoid blocking
                response = await asyncio.to_thread(
                    self._client.chat.completions.create,
                    messages=messages,
                    model=self._model,
                    temperature=0.7,
                    max_tokens=2048,
                    top_p=0.9,
                    stream=False,
                )

                content = response.choices[0].message.content
                logger.info(
                    f"AI response generated: model={self._model}, "
                    f"tokens={response.usage.total_tokens if response.usage else 'N/A'}"
                )
                return {
                    "content": content,
                    "model": self._model,
                }

            except RateLimitError as e:
                wait = RETRY_DELAYS[min(attempt, len(RETRY_DELAYS) - 1)]
                logger.warning(f"Rate limited (attempt {attempt + 1}/{MAX_RETRIES}), waiting {wait}s: {e}")
                await asyncio.sleep(wait)

            except APIConnectionError as e:
                wait = RETRY_DELAYS[min(attempt, len(RETRY_DELAYS) - 1)]
                logger.warning(f"Connection error (attempt {attempt + 1}/{MAX_RETRIES}), waiting {wait}s: {e}")
                await asyncio.sleep(wait)

            except APIError as e:
                logger.error(f"Groq API error: {e}")
                break

            except Exception as e:
                logger.error(f"Unexpected AI error: {e}")
                break

        # All retries exhausted — return fallback
        logger.error("All AI retries exhausted, returning fallback response.")
        return {
            "content": self._fallback_response(message, interest),
            "model": "fallback",
        }

    # ── Streaming Completion ───────────────────────────────

    async def generate_stream(
        self,
        message: str,
        history: list[dict],
        interest: Optional[str] = None,
        user_name: Optional[str] = None,
        learning_style: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Generate a streaming AI response, yielding tokens one by one.

        Yields:
            Individual text tokens/chunks from the LLM.
        """
        if not self._client:
            # Fallback: stream the fallback response character by character
            fallback = self._fallback_response(message, interest)
            for char in fallback:
                yield char
                await asyncio.sleep(0.01)
            return

        system_prompt = build_system_prompt(interest, user_name, learning_style)
        messages = build_chat_messages(system_prompt, history, message)

        for attempt in range(MAX_RETRIES):
            try:
                # Create streaming completion in thread pool
                stream = await asyncio.to_thread(
                    self._client.chat.completions.create,
                    messages=messages,
                    model=self._model,
                    temperature=0.7,
                    max_tokens=2048,
                    top_p=0.9,
                    stream=True,
                )

                # Yield tokens from the stream
                for chunk in stream:
                    if chunk.choices and chunk.choices[0].delta.content:
                        token = chunk.choices[0].delta.content
                        yield token

                logger.info(f"Stream completed: model={self._model}")
                return  # Success — exit the retry loop

            except RateLimitError as e:
                wait = RETRY_DELAYS[min(attempt, len(RETRY_DELAYS) - 1)]
                logger.warning(f"Stream rate limited (attempt {attempt + 1}), waiting {wait}s: {e}")
                await asyncio.sleep(wait)

            except APIConnectionError as e:
                wait = RETRY_DELAYS[min(attempt, len(RETRY_DELAYS) - 1)]
                logger.warning(f"Stream connection error (attempt {attempt + 1}), waiting {wait}s: {e}")
                await asyncio.sleep(wait)

            except APIError as e:
                logger.error(f"Stream API error: {e}")
                break

            except Exception as e:
                logger.error(f"Unexpected stream error: {e}")
                break

        # Fallback if all retries fail
        logger.error("All stream retries exhausted, yielding fallback.")
        fallback = self._fallback_response(message, interest)
        for char in fallback:
            yield char
            await asyncio.sleep(0.01)

    # ── Fallback Response ──────────────────────────────────

    @staticmethod
    def _fallback_response(message: str, interest: Optional[str] = None) -> str:
        """
        Generate a helpful fallback response when the AI is unavailable.
        """
        interest_label = interest.capitalize() if interest else "your interests"
        return (
            f"I'd love to help you explore that topic through the lens of "
            f"**{interest_label}**! 🌟\n\n"
            f"It looks like I'm having trouble connecting to my AI engine right now. "
            f"Here's what I suggest:\n\n"
            f"1. **Check your connection** — Make sure the Groq API key is configured.\n"
            f"2. **Try again in a moment** — I might just need a quick breather.\n"
            f"3. **Rephrase your question** — Sometimes a different angle helps!\n\n"
            f"Your question: *\"{message[:100]}{'...' if len(message) > 100 else ''}\"*\n\n"
            f"I'll be ready to give you an amazing, personalized explanation as soon as "
            f"I'm back online! 💪"
        )


# Global singleton
ai_service = AIService()
