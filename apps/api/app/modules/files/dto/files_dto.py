from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class InitUploadDto(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sizeBytes: int = Field(..., gt=0)
    mimeType: str = Field(..., min_length=3, max_length=128)
    folderId: str | None = None


class InitUploadResponseDto(BaseModel):
    fileId: str
    storageKey: str
    uploadUrl: str
    expiresIn: int = 3600


class CompleteUploadDto(BaseModel):
    fileId: str


class DownloadUrlResponseDto(BaseModel):
    downloadUrl: str
    filename: str
    expiresIn: int = 3600


class UpdateFileDto(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    folderId: str | None = None


class FileResponseDto(BaseModel):
    id: str
    name: str
    sizeBytes: int
    mimeType: str
    folderId: str | None
    ownerId: str
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)
