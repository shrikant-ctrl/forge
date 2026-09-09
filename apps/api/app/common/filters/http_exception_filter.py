from datetime import UTC, datetime

from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.exceptions import HttpException


async def http_exception_filter(request: Request, exc: HttpException) -> JSONResponse:
    """Standardizes application exceptions into a consistent NestJS-formatted error payload."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "statusCode": exc.status_code,
            "message": exc.message,
            "error": exc.error,
            "details": exc.details,
            "timestamp": datetime.now(UTC).isoformat(),
            "path": request.url.path,
        },
    )
