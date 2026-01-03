"""Mentor assignment business logic."""

from datetime import datetime

from redis.asyncio import Redis

from app.db.redis_client import ASSIGNMENT_QUEUE_KEY
from app.schemas.assignment import AssignmentQueueItem


class AssignmentService:
    def __init__(self, redis: Redis):
        self.redis = redis

    async def enqueue_student(self, student_id: str, priority: int = 0) -> None:
        item = AssignmentQueueItem(student_id=student_id, requested_at=datetime.utcnow(), priority=priority)
        score = item.priority or datetime.utcnow().timestamp()
        await self.redis.zadd(ASSIGNMENT_QUEUE_KEY, {item.student_id: score})

    async def dequeue_student(self) -> str | None:
        result = await self.redis.zpopmin(ASSIGNMENT_QUEUE_KEY)
        if not result:
            return None
        student_id, _score = result[0]
        return student_id


__all__ = ["AssignmentService"]
