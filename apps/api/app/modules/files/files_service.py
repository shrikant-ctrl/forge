import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends

from app.core.db import get_db
from app.core.exceptions import BadRequestException, NotFoundException
from app.modules.files.dto.files_dto import (
    DownloadUrlResponseDto,
    FileResponseDto,
    InitUploadDto,
    InitUploadResponseDto,
    UpdateFileDto,
)
from app.modules.storage.storage_service import StorageService, get_storage_service
from prisma import Prisma


class FilesService:
    """Injectable provider managing file records, S3 presigned URLs, and quota tracking."""

    def __init__(self, db: Prisma, storage: StorageService):
        self.db = db
        self.storage = storage

    async def init_upload(
        self, dto: InitUploadDto, user_id: str
    ) -> InitUploadResponseDto:
        # Check user exists and has enough storage quota
        user = await self.db.user.find_unique(where={"id": user_id})
        if not user:
            raise NotFoundException("User not found")

        if int(user.usedStorage) + dto.sizeBytes > int(user.storageQuota):
            raise BadRequestException(
                "Storage quota exceeded. Please free up space or upgrade storage limit."
            )

        # Verify target folder if specified
        if dto.folderId:
            folder = await self.db.folder.find_first(
                where={"id": dto.folderId, "ownerId": user_id, "isDeleted": False}
            )
            if not folder:
                raise NotFoundException(f"Folder '{dto.folderId}' not found")

        # Generate unique storage key: users/{user_id}/{uuid}_{filename}
        storage_key = f"users/{user_id}/{uuid.uuid4()}_{dto.name}"

        # Create file record in database
        file = await self.db.file.create(
            data={
                "name": dto.name,
                "sizeBytes": dto.sizeBytes,
                "mimeType": dto.mimeType,
                "storageKey": storage_key,
                "folderId": dto.folderId,
                "ownerId": user_id,
            }
        )

        # Generate presigned PUT upload URL
        upload_url = self.storage.generate_presigned_upload_url(
            storage_key=storage_key,
            mime_type=dto.mimeType,
            expires_in=3600,
        )

        return InitUploadResponseDto(
            fileId=file.id,
            storageKey=storage_key,
            uploadUrl=upload_url,
            expiresIn=3600,
        )

    async def complete_upload(self, file_id: str, user_id: str) -> FileResponseDto:
        file = await self.db.file.find_first(
            where={"id": file_id, "ownerId": user_id, "isDeleted": False}
        )
        if not file:
            raise NotFoundException(f"File '{file_id}' not found")

        # Increment user's usedStorage atomically
        await self.db.user.update(
            where={"id": user_id},
            data={"usedStorage": {"increment": file.sizeBytes}},
        )

        # Create initial Version 1 record
        await self.db.fileversion.create(
            data={
                "fileId": file.id,
                "versionNumber": 1,
                "storageKey": file.storageKey,
                "sizeBytes": file.sizeBytes,
            }
        )

        return FileResponseDto(
            id=file.id,
            name=file.name,
            sizeBytes=int(file.sizeBytes),
            mimeType=file.mimeType,
            folderId=file.folderId,
            ownerId=file.ownerId,
            createdAt=file.createdAt,
            updatedAt=file.updatedAt,
        )

    async def get_download_url(
        self, file_id: str, user_id: str
    ) -> DownloadUrlResponseDto:
        file = await self.db.file.find_first(
            where={"id": file_id, "ownerId": user_id, "isDeleted": False}
        )
        if not file:
            raise NotFoundException(f"File '{file_id}' not found")

        download_url = self.storage.generate_presigned_download_url(
            storage_key=file.storageKey,
            filename=file.name,
            expires_in=3600,
        )

        return DownloadUrlResponseDto(
            downloadUrl=download_url,
            filename=file.name,
            expiresIn=3600,
        )

    async def list_files(
        self,
        user_id: str,
        folder_id: str | None = None,
        search: str | None = None,
    ) -> list[FileResponseDto]:
        where: dict = {
            "ownerId": user_id,
            "isDeleted": False,
        }
        if folder_id is not None:
            where["folderId"] = folder_id
        if search:
            where["name"] = {"contains": search, "mode": "insensitive"}

        files = await self.db.file.find_many(
            where=where,
            order={"updatedAt": "desc"},
        )

        return [
            FileResponseDto(
                id=f.id,
                name=f.name,
                sizeBytes=int(f.sizeBytes),
                mimeType=f.mimeType,
                folderId=f.folderId,
                ownerId=f.ownerId,
                createdAt=f.createdAt,
                updatedAt=f.updatedAt,
            )
            for f in files
        ]

    async def get_file(self, file_id: str, user_id: str) -> FileResponseDto:
        file = await self.db.file.find_first(
            where={"id": file_id, "ownerId": user_id, "isDeleted": False}
        )
        if not file:
            raise NotFoundException(f"File '{file_id}' not found")

        return FileResponseDto(
            id=file.id,
            name=file.name,
            sizeBytes=int(file.sizeBytes),
            mimeType=file.mimeType,
            folderId=file.folderId,
            ownerId=file.ownerId,
            createdAt=file.createdAt,
            updatedAt=file.updatedAt,
        )

    async def update_file(
        self, file_id: str, dto: UpdateFileDto, user_id: str
    ) -> FileResponseDto:
        file = await self.db.file.find_first(
            where={"id": file_id, "ownerId": user_id, "isDeleted": False}
        )
        if not file:
            raise NotFoundException(f"File '{file_id}' not found")

        data: dict = {}
        if dto.name is not None:
            data["name"] = dto.name
        if dto.folderId is not None:
            folder = await self.db.folder.find_first(
                where={"id": dto.folderId, "ownerId": user_id, "isDeleted": False}
            )
            if not folder:
                raise NotFoundException(f"Target folder '{dto.folderId}' not found")
            data["folderId"] = dto.folderId

        updated = await self.db.file.update(
            where={"id": file_id},
            data=data,
        )
        assert updated is not None

        return FileResponseDto(
            id=updated.id,
            name=updated.name,
            sizeBytes=int(updated.sizeBytes),
            mimeType=updated.mimeType,
            folderId=updated.folderId,
            ownerId=updated.ownerId,
            createdAt=updated.createdAt,
            updatedAt=updated.updatedAt,
        )

    async def delete_file(self, file_id: str, user_id: str) -> None:
        file = await self.db.file.find_first(
            where={"id": file_id, "ownerId": user_id, "isDeleted": False}
        )
        if not file:
            raise NotFoundException(f"File '{file_id}' not found")

        # Soft-delete file
        await self.db.file.update(
            where={"id": file_id},
            data={"isDeleted": True, "deletedAt": datetime.now(UTC)},
        )


def get_files_service(
    db: Annotated[Prisma, Depends(get_db)],
    storage: Annotated[StorageService, Depends(get_storage_service)],
) -> FilesService:
    """FastAPI provider/dependency for FilesService."""
    return FilesService(db, storage)
