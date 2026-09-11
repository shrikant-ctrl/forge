from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterDto(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    name: str = Field(..., min_length=2, max_length=100)


class LoginDto(BaseModel):
    email: EmailStr
    password: str


class TokenResponseDto(BaseModel):
    accessToken: str
    refreshToken: str
    tokenType: str = "Bearer"
    expiresIn: int


class UserDto(BaseModel):
    id: str
    email: str
    name: str
    role: str
    storageQuota: int
    usedStorage: int
    createdAt: datetime

    model_config = ConfigDict(from_attributes=True)


class RefreshTokenDto(BaseModel):
    refreshToken: str
