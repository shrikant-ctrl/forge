from typing import Any

from fastapi import status


class HttpException(Exception):
    """Base NestJS-style HTTP exception."""

    def __init__(
        self,
        status_code: int,
        message: str,
        error: str | None = None,
        details: Any = None,
    ):
        self.status_code = status_code
        self.message = message
        self.error = error or self._default_error(status_code)
        self.details = details
        super().__init__(message)

    @staticmethod
    def _default_error(status_code: int) -> str:
        mapping = {
            status.HTTP_400_BAD_REQUEST: "Bad Request",
            status.HTTP_401_UNAUTHORIZED: "Unauthorized",
            status.HTTP_403_FORBIDDEN: "Forbidden",
            status.HTTP_404_NOT_FOUND: "Not Found",
            status.HTTP_409_CONFLICT: "Conflict",
            status.HTTP_422_UNPROCESSABLE_ENTITY: "Unprocessable Entity",
            status.HTTP_500_INTERNAL_SERVER_ERROR: "Internal Server Error",
        }
        return mapping.get(status_code, "Error")


class BadRequestException(HttpException):
    def __init__(self, message: str = "Bad Request", details: Any = None):
        super().__init__(status.HTTP_400_BAD_REQUEST, message, "Bad Request", details)


class UnauthorizedException(HttpException):
    def __init__(self, message: str = "Unauthorized", details: Any = None):
        super().__init__(status.HTTP_401_UNAUTHORIZED, message, "Unauthorized", details)


class ForbiddenException(HttpException):
    def __init__(self, message: str = "Forbidden", details: Any = None):
        super().__init__(status.HTTP_403_FORBIDDEN, message, "Forbidden", details)


class NotFoundException(HttpException):
    def __init__(self, message: str = "Not Found", details: Any = None):
        super().__init__(status.HTTP_404_NOT_FOUND, message, "Not Found", details)


class ConflictException(HttpException):
    def __init__(self, message: str = "Conflict", details: Any = None):
        super().__init__(status.HTTP_409_CONFLICT, message, "Conflict", details)
