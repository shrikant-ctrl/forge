from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CreateFolderDto(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    parentId: str | None = None


class UpdateFolderDto(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    parentId: str | None = None


class BreadcrumbDto(BaseModel):
    id: str
    name: str


class FolderResponseDto(BaseModel):
    id: str
    name: str
    parentId: str | None
    ownerId: str
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)


class FolderDetailResponseDto(FolderResponseDto):
    breadcrumbs: list[BreadcrumbDto] = []
