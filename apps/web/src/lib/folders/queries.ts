import { queryOptions } from "@tanstack/react-query";
import { api } from "../api/client";
import { normalizeError } from "../api/errors";
import type { FolderDetailResponseDto, FolderResponseDto } from "../api/types";

export function foldersQueryOptions(parentId: string | null) {
	return queryOptions({
		queryKey: ["folders", parentId] as const,
		queryFn: async (): Promise<FolderResponseDto[]> => {
			const { data, error, response } = await api.GET("/api/folders", {
				params: { query: parentId ? { parentId } : {} },
			});
			if (error) throw await normalizeError(response);
			return data;
		},
	});
}

export function folderDetailQueryOptions(id: string) {
	return queryOptions({
		queryKey: ["folders", "detail", id] as const,
		queryFn: async (): Promise<FolderDetailResponseDto> => {
			const { data, error, response } = await api.GET("/api/folders/{id}", {
				params: { path: { id } },
			});
			if (error) throw await normalizeError(response);
			return data;
		},
	});
}
