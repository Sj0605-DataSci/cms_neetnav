# backend

A project created with FastAPI CLI.

## Quick Start

## Prerequisites

- [uv](https://docs.astral.sh/uv/) for dependency + environment management
- Local Redis instance (default URL `redis://localhost:6379/0`)
- Supabase project (or Postgres-compatible API) with tables for users, student/mentor profiles, documents, and assignments

## Environment configuration

Create a `.env` file alongside `pyproject.toml` with at least the following values:

```
SUPABASE_URL="https://<your-project>.supabase.co"
SUPABASE_ANON_KEY="public-anon-key"
SUPABASE_SERVICE_KEY="service-role-key"
REDIS_URL="redis://localhost:6379/0"
JWT_SECRET_KEY="change-me"
```

You can also override other settings defined in `app/core/config.py` (e.g., `PROJECT_NAME`, `ACCESS_TOKEN_EXPIRE_MINUTES`).

## Start the development server

```bash
uv run fastapi dev
```

Visit http://localhost:8000 for the root check or http://localhost:8000/docs for the interactive API docs (enabled by default in non-production environments).

## Project structure highlights

- `app/core`: configuration, logging, security, and dependency wiring
- `app/db`: Supabase/Redis clients plus repositories for users, students, mentors, documents, assignments
- `app/services`: business logic for auth, students, mentors, admins, and matching
- `app/routers`: API routes (to be expanded) mounted under `/api`

## Next steps

1. Define remaining Supabase tables (students_profiles, mentors_profiles, documents, assignments) matching the schemas in `app/schemas`.
2. Wire routers for `/api/auth`, `/api/students`, `/api/mentors`, `/api/admin`, `/api/documents`, and `/api/matching` using the services provided in `app/services`.
3. Connect Supabase Storage for actual file uploads and replace the placeholder storage paths in document services.
4. Add automated tests under `app/tests` (httpx + pytest + fakeredis) for core flows.

## Learn more

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Redis Documentation](https://redis.io/docs/latest/)
- [Supabase Documentation](https://supabase.com/docs)
