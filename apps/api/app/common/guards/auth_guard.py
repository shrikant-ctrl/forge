from typing import Annotated

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from prisma.models import User

from app.core.db import get_db
from app.core.exceptions import UnauthorizedException
from app.core.security import decode_access_token
from prisma import Prisma

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[Prisma, Depends(get_db)],
) -> User:
    """NestJS-style AuthGuard dependency that validates JWT Bearer tokens."""
    if not credentials or credentials.scheme.lower() != "bearer":
        raise UnauthorizedException("Authentication credentials were not provided")

    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Invalid token payload")
    except jwt.PyJWTError as e:
        raise UnauthorizedException(f"Token validation failed: {e!s}") from e

    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise UnauthorizedException("User associated with this token no longer exists")

    return user


# AuthGuard type alias for cleaner dependency injection
AuthGuard = Annotated[User, Depends(get_current_user)]
