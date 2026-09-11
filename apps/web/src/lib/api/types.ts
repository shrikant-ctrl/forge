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
