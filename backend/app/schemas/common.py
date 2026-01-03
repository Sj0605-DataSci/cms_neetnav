"""Shared schema definitions."""

from enum import Enum


class UserRole(str, Enum):
    STUDENT = "student"
    MENTOR = "mentor"
    ADMIN = "admin"


USER_ROLE_VALUES = {role.value for role in UserRole}

__all__ = ["UserRole", "USER_ROLE_VALUES"]
