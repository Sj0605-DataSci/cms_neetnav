"""Utility helpers related to identifier generation."""

from uuid import uuid4


def generate_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex}"


__all__ = ["generate_id"]
