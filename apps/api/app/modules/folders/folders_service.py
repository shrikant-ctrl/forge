from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends

from app.core.db import get_db
from app.core.exceptions import BadRequestException, NotFoundException
from app.modules.folders.dto.folders_dto import (
    BreadcrumbDto,
    CreateFolderDto,
    FolderDetailResponseDto,
    FolderResponseDto,
    UpdateFolderDto,
)
from prisma import Prisma


class FoldersService:
    """Injectable provider managing hierarchical folder lifecycle and tree traversal."""

    def __init__(self, db: Prisma):
        self.db = db

    async def create_folder(
        self, dto: CreateFolderDto, user_id: str
    ) -> FolderResponseDto:
        if dto.parentId:
            parent = await self.db.folder.find_first(
                where={"id": dto.parentId, "ownerId": user_id, "isDeleted": False}
            )
            if not parent:
                raise NotFoundException(
                    f"Parent folder with ID '{dto.parentId}' not found"
                )

        folder = await self.db.folder.create(
            data={
                "name": dto.name,
                "parentId": dto.parentId,
                "ownerId": user_id,
            }
        )

        return FolderResponseDto(
            id=folder.id,
            name=folder.name,
            parentId=folder.parentId,
            ownerId=folder.ownerId,
            createdAt=folder.createdAt,
            updatedAt=folder.updatedAt,
        )

    async def list_folders(
        self, user_id: str, parent_id: str | None = None
    ) -> list[FolderResponseDto]:
        folders = await self.db.folder.find_many(
            where={
                "ownerId": user_id,
                "parentId": parent_id,
                "isDeleted": False,
            },
            order={"name": "asc"},
        )
        return [
            FolderResponseDto(
                id=f.id,
                name=f.name,
                parentId=f.parentId,
                ownerId=f.ownerId,
                createdAt=f.createdAt,
                updatedAt=f.updatedAt,
            )
            for f in folders
        ]

    async def get_folder(self, folder_id: str, user_id: str) -> FolderDetailResponseDto:
        folder = await self.db.folder.find_first(
            where={"id": folder_id, "ownerId": user_id, "isDeleted": False}
        )
        if not folder:
            raise NotFoundException(f"Folder with ID '{folder_id}' not found")

        # Resolve breadcrumbs upwards to root
        breadcrumbs: list[BreadcrumbDto] = []
        curr_parent_id = folder.parentId
        while curr_parent_id:
            parent = await self.db.folder.find_unique(where={"id": curr_parent_id})
            if not parent:
                break
            breadcrumbs.insert(0, BreadcrumbDto(id=parent.id, name=parent.name))
            curr_parent_id = parent.parentId

        return FolderDetailResponseDto(
            id=folder.id,
            name=folder.name,
            parentId=folder.parentId,
            ownerId=folder.ownerId,
            createdAt=folder.createdAt,
            updatedAt=folder.updatedAt,
            breadcrumbs=breadcrumbs,
        )

    async def update_folder(
        self, folder_id: str, dto: UpdateFolderDto, user_id: str
    ) -> FolderResponseDto:
        folder = await self.db.folder.find_first(
            where={"id": folder_id, "ownerId": user_id, "isDeleted": False}
        )
        if not folder:
            raise NotFoundException(f"Folder with ID '{folder_id}' not found")

        if dto.parentId == folder_id:
            raise BadRequestException("A folder cannot be its own parent")

        data: dict = {}
        if dto.name is not None:
            data["name"] = dto.name
        if dto.parentId is not None:
            parent = await self.db.folder.find_first(
                where={"id": dto.parentId, "ownerId": user_id, "isDeleted": False}
            )
            if not parent:
                raise NotFoundException(
                    f"Target parent folder '{dto.parentId}' not found"
                )
            data["parentId"] = dto.parentId

        updated = await self.db.folder.update(
            where={"id": folder_id},
            data=data,
        )
        assert updated is not None

        return FolderResponseDto(
            id=updated.id,
            name=updated.name,
            parentId=updated.parentId,
            ownerId=updated.ownerId,
            createdAt=updated.createdAt,
            updatedAt=updated.updatedAt,
        )

    async def delete_folder(self, folder_id: str, user_id: str) -> None:
        folder = await self.db.folder.find_first(
            where={"id": folder_id, "ownerId": user_id, "isDeleted": False}
        )
        if not folder:
            raise NotFoundException(f"Folder with ID '{folder_id}' not found")

        # Soft delete folder
        await self.db.folder.update(
            where={"id": folder_id},
            data={"isDeleted": True, "deletedAt": datetime.now(UTC)},
        )


def get_folders_service(db: Annotated[Prisma, Depends(get_db)]) -> FoldersService:
    """FastAPI provider/dependency for FoldersService."""
    return FoldersService(db)
