"""Redis client management."""

from redis.asyncio import Redis

from app.core.config import settings

_redis_client: Redis | None = None


def get_redis_client() -> Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = Redis.from_url(settings.redis_url, decode_responses=True)
    return _redis_client


ASSIGNMENT_QUEUE_KEY = "assignment:queue"
MENTOR_CAPACITY_KEY = "mentor:capacity"

__all__ = [
    "get_redis_client",
    "ASSIGNMENT_QUEUE_KEY",
    "MENTOR_CAPACITY_KEY",
]
