import type { components } from "./schema.gen";

export type RegisterDto = components["schemas"]["RegisterDto"];
export type LoginDto = components["schemas"]["LoginDto"];
export type TokenResponseDto = components["schemas"]["TokenResponseDto"];
export type UserDto = components["schemas"]["UserDto"];
export type RefreshTokenDto = components["schemas"]["RefreshTokenDto"];

export type FolderResponseDto = components["schemas"]["FolderResponseDto"];
export type FolderDetailResponseDto =
	components["schemas"]["FolderDetailResponseDto"];
export type CreateFolderDto = components["schemas"]["CreateFolderDto"];
export type UpdateFolderDto = components["schemas"]["UpdateFolderDto"];
export type BreadcrumbDto = components["schemas"]["BreadcrumbDto"];

export type FileResponseDto = components["schemas"]["FileResponseDto"];
export type InitUploadDto = components["schemas"]["InitUploadDto"];
export type InitUploadResponseDto =
	components["schemas"]["InitUploadResponseDto"];
export type CompleteUploadDto = components["schemas"]["CompleteUploadDto"];
export type UpdateFileDto = components["schemas"]["UpdateFileDto"];
export type DownloadUrlResponseDto =
	components["schemas"]["DownloadUrlResponseDto"];
