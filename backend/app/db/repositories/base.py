"""Base repository primitives for Supabase persistence."""

from supabase import Client


class BaseRepository:
    table_name: str

    def __init__(self, client: Client):
        self._client = client

    @property
    def client(self) -> Client:
        return self._client

    def table(self):
        return self._client.table(self.table_name)


__all__ = ["BaseRepository"]
