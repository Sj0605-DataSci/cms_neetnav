"""Aggregate API router for the FastAPI application."""

from fastapi import APIRouter

from app.routers import admin, auth, documents, matching, mentors, students

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(students.router)
api_router.include_router(mentors.router)
api_router.include_router(admin.router)
api_router.include_router(documents.router)
api_router.include_router(matching.router)

__all__ = ["api_router"]
