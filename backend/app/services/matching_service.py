"""Matching and assignment orchestration."""

from typing import Optional

from app.db.repositories.mentors import MentorRepository
from app.db.repositories.students import StudentRepository
from app.schemas.mentor import MentorProfile
from app.services.assignment_service import AssignmentService


class MatchingService:
    def __init__(
        self,
        assignment_service: AssignmentService,
        student_repo: StudentRepository,
        mentor_repo: MentorRepository,
    ):
        self.assignment_service = assignment_service
        self.student_repo = student_repo
        self.mentor_repo = mentor_repo

    async def enqueue_student(self, student_id: str) -> None:
        await self.assignment_service.enqueue_student(student_id)

    async def process_queue(self) -> dict:
        assignments = []
        student_id = await self.assignment_service.dequeue_student()
        while student_id:
            mentor = self._find_available_mentor()
            if mentor is None:
                await self.assignment_service.enqueue_student(student_id, priority=1)
                break
            self.student_repo.assign_mentor(student_id, mentor.user_id)
            self.mentor_repo.update_assigned_students(mentor.user_id, delta=1)
            assignments.append({"student_id": student_id, "mentor_id": mentor.user_id})
            student_id = await self.assignment_service.dequeue_student()
        return {"processed": len(assignments), "assignments": assignments}

    def _find_available_mentor(self) -> Optional[MentorProfile]:
        mentors = self.mentor_repo.list_all()
        available = [m for m in mentors if m.capacity > m.assigned_students and m.documents_verified]
        available.sort(key=lambda m: m.assigned_students / m.capacity if m.capacity else 1)
        return available[0] if available else None


__all__ = ["MatchingService"]
