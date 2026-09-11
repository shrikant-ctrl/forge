import { queryOptions } from "@tanstack/react-query";
import { api } from "../api/client";
import { normalizeError } from "../api/errors";
import type { FileResponseDto } from "../api/types";

interface FilesQueryParams {
	folderId?: string;
	search?: string;
}

export function filesQueryOptions(params: FilesQueryParams = {}) {
	return queryOptions({
		queryKey: ["files", params] as const,
		queryFn: async (): Promise<FileResponseDto[]> => {
			const { data, error, response } = await api.GET("/api/files", {
				params: { query: params },
			});
			if (error) throw await normalizeError(response);
			return data;
		},
	});
}

// omitting folderId returns ALL files regardless of folder — the same
// request/cache entry serves both the root Drive view (filtered client-side
// to folderId === null) and Recent (which wants everything anyway).
export function allFilesQueryOptions() {
	return filesQueryOptions({});
}

export function folderFilesQueryOptions(folderId: string) {
	return filesQueryOptions({ folderId });
}

export function searchFilesQueryOptions(search: string) {
	return filesQueryOptions({ search });
}

export function fileDetailQueryOptions(id: string) {
	return queryOptions({
		queryKey: ["files", "detail", id] as const,
		queryFn: async (): Promise<FileResponseDto> => {
			const { data, error, response } = await api.GET("/api/files/{id}", {
				params: { path: { id } },
			});
			if (error) throw await normalizeError(response);
			return data;
		},
	});
}
