from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.common.guards.auth_guard import AuthGuard
from app.modules.folders.dto.folders_dto import (
    CreateFolderDto,
    FolderDetailResponseDto,
    FolderResponseDto,
    UpdateFolderDto,
)
from app.modules.folders.folders_service import FoldersService, get_folders_service

router = APIRouter(prefix="/folders", tags=["Folders"])


@router.post(
    "",
    response_model=FolderResponseDto,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new folder",
)
async def create_folder(
    dto: CreateFolderDto,
    current_user: AuthGuard,
    service: Annotated[FoldersService, Depends(get_folders_service)],
) -> FolderResponseDto:
    """NestJS-style FoldersController: creates a folder in the user's hierarchy."""
    return await service.create_folder(dto, user_id=current_user.id)


@router.get(
    "",
    response_model=list[FolderResponseDto],
    status_code=status.HTTP_200_OK,
    summary="List folders in a parent directory (or root)",
)
async def list_folders(
    current_user: AuthGuard,
    service: Annotated[FoldersService, Depends(get_folders_service)],
    parentId: Annotated[
        str | None, Query(description="Parent folder ID (omit for root)")
    ] = None,
) -> list[FolderResponseDto]:
    """Lists non-deleted folders owned by the authenticated user."""
    return await service.list_folders(user_id=current_user.id, parent_id=parentId)


@router.get(
    "/{id}",
    response_model=FolderDetailResponseDto,
    status_code=status.HTTP_200_OK,
    summary="Get folder details with breadcrumbs",
)
async def get_folder(
    id: str,
    current_user: AuthGuard,
    service: Annotated[FoldersService, Depends(get_folders_service)],
) -> FolderDetailResponseDto:
    """Retrieves a folder and resolves its breadcrumb path."""
    return await service.get_folder(folder_id=id, user_id=current_user.id)


@router.patch(
    "/{id}",
    response_model=FolderResponseDto,
    status_code=status.HTTP_200_OK,
    summary="Rename or move a folder",
)
async def update_folder(
    id: str,
    dto: UpdateFolderDto,
    current_user: AuthGuard,
    service: Annotated[FoldersService, Depends(get_folders_service)],
) -> FolderResponseDto:
    """Updates folder metadata or moves it into another parent folder."""
    return await service.update_folder(folder_id=id, dto=dto, user_id=current_user.id)


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Soft-delete a folder",
)
async def delete_folder(
    id: str,
    current_user: AuthGuard,
    service: Annotated[FoldersService, Depends(get_folders_service)],
) -> None:
    """Soft-deletes a folder and moves it to trash."""
    await service.delete_folder(folder_id=id, user_id=current_user.id)
