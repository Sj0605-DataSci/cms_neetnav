from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.core.logging import configure_logging
from app.routers import api_router


def get_application() -> FastAPI:
    configure_logging()
    application = FastAPI(
        title=settings.project_name,
        version=settings.version,
        docs_url="/docs" if settings.enable_docs else None,
        redoc_url="/redoc" if settings.enable_docs else None,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

    logger = logging.getLogger("uvicorn.error")

    @application.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        request_body = await request.body()
        logger.error(
            "Validation failed for %s %s: %s (body=%s)",
            request.method,
            request.url.path,
            exc.errors(),
            request_body.decode("utf-8", errors="ignore"),
        )
        return JSONResponse(status_code=422, content={"detail": exc.errors()})

    application.include_router(api_router)
    return application


app = get_application()
