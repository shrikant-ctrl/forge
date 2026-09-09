from typing import Annotated

from fastapi import Depends

from app.core.config import settings
from app.core.db import get_db
from app.core.exceptions import (
    BadRequestException,
    ConflictException,
    UnauthorizedException,
)
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth.dto.auth_dto import (
    LoginDto,
    RegisterDto,
    TokenResponseDto,
    UserDto,
)
from prisma import Prisma


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

        access_token = create_access_token(
            subject=user.id,
            claims={
                "role": user.role.value
                if hasattr(user.role, "value")
                else str(user.role)
            },
        )

        return TokenResponseDto(
            accessToken=access_token,
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
