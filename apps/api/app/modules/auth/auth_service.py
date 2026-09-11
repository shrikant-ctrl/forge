from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import Depends

from app.core.config import settings
from app.core.db import get_db
from app.core.exceptions import (
    BadRequestException,
    ConflictException,
    UnauthorizedException,
)
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.modules.auth.dto.auth_dto import (
    LoginDto,
    RefreshTokenDto,
    RegisterDto,
    TokenResponseDto,
    UserDto,
)
from prisma import Prisma

REFRESH_TOKEN_REUSE_MESSAGE = "Refresh token has already been used; all sessions have been revoked"


class AuthService:
    """Injectable authentication service handling user registration, credentials, and token lifecycle."""

    def __init__(self, db: Prisma):
        self.db = db

    async def register(self, dto: RegisterDto) -> UserDto:
        # Check if user already exists
        existing_user = await self.db.user.find_unique(where={"email": dto.email})
        if existing_user:
            raise ConflictException(f"User with email '{dto.email}' already exists")

        # Hash password and persist user
        hashed = hash_password(dto.password)
        user = await self.db.user.create(
            data={
                "email": dto.email,
                "name": dto.name,
                "passwordHash": hashed,
            }
        )

        return UserDto(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role.value if hasattr(user.role, "value") else str(user.role),
            storageQuota=int(user.storageQuota),
            usedStorage=int(user.usedStorage),
            createdAt=user.createdAt,
        )

    async def login(self, dto: LoginDto) -> TokenResponseDto:
        user = await self.db.user.find_unique(where={"email": dto.email})
        if not user or not verify_password(dto.password, user.passwordHash):
            raise UnauthorizedException("Invalid email or password")

        role = user.role.value if hasattr(user.role, "value") else str(user.role)
        return await self._issue_tokens(user.id, role)

    async def refresh(self, dto: RefreshTokenDto) -> TokenResponseDto:
        token_hash = hash_token(dto.refreshToken)
        stored = await self.db.refreshtoken.find_unique(where={"tokenHash": token_hash})
        if not stored:
            raise UnauthorizedException("Invalid refresh token")

        if stored.revokedAt is not None:
            # Reuse of an already-rotated token is a signal of theft: kill every active session.
            await self.db.refreshtoken.update_many(
                where={"userId": stored.userId, "revokedAt": None},
                data={"revokedAt": datetime.now(UTC)},
            )
            raise UnauthorizedException(REFRESH_TOKEN_REUSE_MESSAGE)

        if stored.expiresAt < datetime.now(UTC):
            raise UnauthorizedException("Refresh token has expired")

        user = await self.db.user.find_unique(where={"id": stored.userId})
        if not user:
            raise UnauthorizedException("User associated with this token no longer exists")

        role = user.role.value if hasattr(user.role, "value") else str(user.role)
        new_tokens = await self._issue_tokens(user.id, role)

        await self.db.refreshtoken.update(
            where={"id": stored.id},
            data={
                "revokedAt": datetime.now(UTC),
                "replacedByTokenHash": hash_token(new_tokens.refreshToken),
            },
        )

        return new_tokens

    async def logout(self, user_id: str, dto: RefreshTokenDto) -> None:
        token_hash = hash_token(dto.refreshToken)
        stored = await self.db.refreshtoken.find_unique(where={"tokenHash": token_hash})
        if not stored or stored.userId != user_id:
            raise UnauthorizedException("Invalid refresh token")

        if stored.revokedAt is None:
            await self.db.refreshtoken.update(
                where={"id": stored.id}, data={"revokedAt": datetime.now(UTC)}
            )

    async def _issue_tokens(self, user_id: str, role: str) -> TokenResponseDto:
        access_token = create_access_token(subject=user_id, claims={"role": role})
        refresh_token = generate_refresh_token()

        await self.db.refreshtoken.create(
            data={
                "tokenHash": hash_token(refresh_token),
                "userId": user_id,
                "expiresAt": datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            }
        )

        return TokenResponseDto(
            accessToken=access_token,
            refreshToken=refresh_token,
            expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def get_me(self, user_id: str) -> UserDto:
        user = await self.db.user.find_unique(where={"id": user_id})
        if not user:
            raise BadRequestException("User profile not found")

        return UserDto(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role.value if hasattr(user.role, "value") else str(user.role),
            storageQuota=int(user.storageQuota),
            usedStorage=int(user.usedStorage),
            createdAt=user.createdAt,
        )


def get_auth_service(db: Annotated[Prisma, Depends(get_db)]) -> AuthService:
    """FastAPI provider/dependency for AuthService."""
    return AuthService(db)
