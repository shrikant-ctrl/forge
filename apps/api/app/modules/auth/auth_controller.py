from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.common.guards.auth_guard import AuthGuard
from app.modules.auth.auth_service import AuthService, get_auth_service
from app.modules.auth.dto.auth_dto import (
    LoginDto,
    RegisterDto,
    TokenResponseDto,
    UserDto,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=UserDto,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    dto: RegisterDto,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> UserDto:
    """NestJS-style AuthController endpoint: registers user and returns created profile."""
    return await service.register(dto)


@router.post(
    "/login",
    response_model=TokenResponseDto,
    status_code=status.HTTP_200_OK,
    summary="Log in and obtain JWT access token",
)
async def login(
    dto: LoginDto,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> TokenResponseDto:
    """Authenticates credentials and returns a signed JWT access token."""
    return await service.login(dto)


@router.get(
    "/me",
    response_model=UserDto,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated user profile",
)
async def get_current_user_profile(
    current_user: AuthGuard,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> UserDto:
    """Protected endpoint guarded by AuthGuard returning current user profile."""
    return await service.get_me(current_user.id)
