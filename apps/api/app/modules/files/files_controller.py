from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.common.guards.auth_guard import AuthGuard
from app.modules.files.dto.files_dto import (
    CompleteUploadDto,
    DownloadUrlResponseDto,
    FileResponseDto,
    InitUploadDto,
    InitUploadResponseDto,
    UpdateFileDto,
)
from app.modules.files.files_service import FilesService, get_files_service

router = APIRouter(prefix="/files", tags=["Files"])


@router.post(
    "/init-upload",
    response_model=InitUploadResponseDto,
    status_code=status.HTTP_201_CREATED,
    summary="Initialize file upload and receive presigned S3 PUT URL",
)
async def init_upload(
    dto: InitUploadDto,
    current_user: AuthGuard,
    service: Annotated[FilesService, Depends(get_files_service)],
) -> InitUploadResponseDto:
    """NestJS-style FilesController: validates quota, registers file record, and generates presigned S3 PUT URL."""
    return await service.init_upload(dto, user_id=current_user.id)


@router.post(
    "/complete-upload",
    response_model=FileResponseDto,
    status_code=status.HTTP_200_OK,
    summary="Confirm file upload completion and finalize record",
)
async def complete_upload(
    dto: CompleteUploadDto,
    current_user: AuthGuard,
    service: Annotated[FilesService, Depends(get_files_service)],
) -> FileResponseDto:
    """Confirms upload, records Version 1, and updates user quota usage."""
    return await service.complete_upload(file_id=dto.fileId, user_id=current_user.id)


@router.get(
    "",
    response_model=list[FileResponseDto],
    status_code=status.HTTP_200_OK,
    summary="List files with optional folder filter or search",
)
async def list_files(
    current_user: AuthGuard,
    service: Annotated[FilesService, Depends(get_files_service)],
    folderId: Annotated[str | None, Query(description="Folder ID to filter by")] = None,
    search: Annotated[
        str | None, Query(description="Search filename substring")
    ] = None,
) -> list[FileResponseDto]:
    """Lists files owned by the authenticated user."""
    return await service.list_files(
        user_id=current_user.id, folder_id=folderId, search=search
    )


@router.get(
    "/{id}",
    response_model=FileResponseDto,
    status_code=status.HTTP_200_OK,
    summary="Get file metadata by ID",
)
async def get_file(
    id: str,
    current_user: AuthGuard,
    service: Annotated[FilesService, Depends(get_files_service)],
) -> FileResponseDto:
    """Retrieves file metadata."""
    return await service.get_file(file_id=id, user_id=current_user.id)


@router.get(
    "/{id}/download-url",
    response_model=DownloadUrlResponseDto,
    status_code=status.HTTP_200_OK,
    summary="Generate a secure presigned S3 download URL",
)
async def get_download_url(
    id: str,
    current_user: AuthGuard,
    service: Annotated[FilesService, Depends(get_files_service)],
) -> DownloadUrlResponseDto:
    """Generates a secure, expiring signed URL for direct file download."""
    return await service.get_download_url(file_id=id, user_id=current_user.id)


@router.patch(
    "/{id}",
    response_model=FileResponseDto,
    status_code=status.HTTP_200_OK,
    summary="Rename or move a file",
)
async def update_file(
    id: str,
    dto: UpdateFileDto,
    current_user: AuthGuard,
    service: Annotated[FilesService, Depends(get_files_service)],
) -> FileResponseDto:
    """Renames or moves a file to a different folder."""
    return await service.update_file(file_id=id, dto=dto, user_id=current_user.id)


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Soft-delete a file",
)
async def delete_file(
    id: str,
    current_user: AuthGuard,
    service: Annotated[FilesService, Depends(get_files_service)],
) -> None:
    """Soft-deletes a file and sends it to trash."""
    await service.delete_file(file_id=id, user_id=current_user.id)
