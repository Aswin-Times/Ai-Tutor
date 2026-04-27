# ============================================
# EduNex AI Tutor — Interest Detection Service
# ============================================
# Detects and manages user interests from message content.
# In production, this would use an ML classifier; here we
# use keyword matching + heuristics as a fast baseline.

from typing import Optional
from loguru import logger


# ── Interest keyword maps ──────────────────────────────────

INTEREST_KEYWORDS: dict[str, list[str]] = {
    "gaming": [
        "game", "gaming", "play", "player", "level", "score", "boss", "quest",
        "rpg", "fps", "mmorpg", "minecraft", "zelda", "fortnite", "xbox",
        "playstation", "nintendo", "steam", "esports", "speedrun", "mod",
        "character", "inventory", "multiplayer", "pvp", "pve", "loot",
    ],
    "cricket": [
        "cricket", "bat", "batting", "bowl", "bowling", "wicket", "run",
        "boundary", "six", "four", "over", "innings", "umpire", "lbw",
        "spin", "pace", "yorker", "ipl", "test match", "odi", "t20",
        "sachin", "virat", "dhoni", "kohli", "pitch", "crease",
    ],
    "music": [
        "music", "song", "sing", "melody", "harmony", "rhythm", "chord",
        "note", "scale", "instrument", "guitar", "piano", "drum", "bass",
        "vocal", "concert", "album", "band", "dj", "beat", "tempo",
        "compose", "symphony", "orchestra", "verse", "chorus", "genre",
    ],
    "coding": [
        "code", "coding", "program", "programming", "function", "variable",
        "algorithm", "loop", "array", "class", "object", "api", "database",
        "python", "javascript", "typescript", "react", "node", "git",
        "debug", "compile", "runtime", "stack", "recursion", "binary",
        "software", "developer", "framework", "library", "bug", "deploy",
    ],
    "movies": [
        "movie", "film", "cinema", "scene", "actor", "actress", "director",
        "plot", "story", "sequel", "prequel", "trailer", "oscar", "hollywood",
        "bollywood", "screenplay", "dialogue", "character", "villain", "hero",
        "animation", "documentary", "thriller", "comedy", "drama", "horror",
    ],
    "cooking": [
        "cook", "cooking", "recipe", "food", "ingredient", "bake", "baking",
        "kitchen", "chef", "dish", "meal", "flavor", "spice", "season",
        "sauté", "grill", "roast", "fry", "boil", "simmer", "knead",
        "dough", "sauce", "garnish", "plating", "cuisine", "restaurant",
    ],
    "sports": [
        "sport", "sports", "goal", "team", "match", "win", "lose",
        "champion", "tournament", "league", "coach", "training", "fitness",
        "athlete", "olympic", "football", "soccer", "basketball", "tennis",
        "swim", "run", "marathon", "medal", "referee", "stadium", "season",
    ],
    "art": [
        "art", "draw", "drawing", "paint", "painting", "sketch", "design",
        "color", "colour", "canvas", "brush", "sculpture", "gallery",
        "museum", "creative", "illustration", "portrait", "landscape",
        "abstract", "perspective", "composition", "palette", "watercolor",
    ],
    "science": [
        "science", "scientific", "experiment", "theory", "hypothesis",
        "atom", "molecule", "cell", "dna", "gene", "evolution", "gravity",
        "physics", "chemistry", "biology", "lab", "microscope", "telescope",
        "particle", "quantum", "element", "periodic", "reaction", "energy",
    ],
    "travel": [
        "travel", "trip", "journey", "country", "city", "explore",
        "adventure", "flight", "passport", "hotel", "tourist", "culture",
        "destination", "backpack", "road trip", "visa", "airport",
        "continent", "island", "beach", "mountain", "monument", "heritage",
    ],
}

# Precompute lowercase keyword sets for O(1) lookup
_KEYWORD_SETS: dict[str, set[str]] = {
    interest: set(kw.lower() for kw in keywords)
    for interest, keywords in INTEREST_KEYWORDS.items()
}


def detect_interest_from_message(
    message: str,
    user_interests: list[str] | None = None,
) -> Optional[str]:
    """
    Detect the most relevant interest from a user message.

    Strategy:
    1. Tokenize the message and count keyword matches per interest.
    2. Prioritize interests the user has selected (bias towards their preferences).
    3. Return the best match, or None if no strong signal.

    Args:
        message: The user's message text.
        user_interests: List of user's preferred interests (given priority).

    Returns:
        The detected interest string, or None.
    """
    if not message:
        return user_interests[0] if user_interests else None

    message_lower = message.lower()
    # Tokenize: split on non-alpha characters
    words = set(message_lower.split())

    scores: dict[str, float] = {}

    for interest, keyword_set in _KEYWORD_SETS.items():
        # Count how many keywords appear in the message
        matches = sum(1 for kw in keyword_set if kw in message_lower)

        if matches > 0:
            score = float(matches)
            # Boost score if this is one of the user's preferred interests
            if user_interests and interest in user_interests:
                score *= 1.5
            scores[interest] = score

    if not scores:
        # No keyword matches — fall back to user's primary interest
        return user_interests[0] if user_interests else None

    # Return the highest-scoring interest
    best = max(scores, key=scores.get)  # type: ignore
    logger.debug(f"Interest detection: scores={scores}, best={best}")
    return best


def get_interest_emoji(interest: str) -> str:
    """Get the emoji for a given interest."""
    EMOJI_MAP = {
        "gaming": "🎮",
        "cricket": "🏏",
        "music": "🎵",
        "coding": "💻",
        "movies": "🎬",
        "cooking": "🍳",
        "sports": "⚽",
        "art": "🎨",
        "science": "🔬",
        "travel": "✈️",
    }
    return EMOJI_MAP.get(interest, "📚")


def get_all_interests() -> list[dict]:
    """Return all available interests with metadata."""
    return [
        {"id": interest, "emoji": get_interest_emoji(interest), "keyword_count": len(keywords)}
        for interest, keywords in INTEREST_KEYWORDS.items()
    ]
