import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { type ApiError, normalizeError } from "../api/errors";
import type {
	CreateFolderDto,
	FolderResponseDto,
	UpdateFolderDto,
} from "../api/types";

export function useCreateFolder() {
	const queryClient = useQueryClient();
	return useMutation<FolderResponseDto, ApiError, CreateFolderDto>({
		mutationFn: async (body) => {
			const { data, error, response } = await api.POST("/api/folders", {
				body,
			});
			if (error) throw await normalizeError(response);
			return data;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["folders"] }),
	});
}

export function useUpdateFolder() {
	const queryClient = useQueryClient();
	return useMutation<
		FolderResponseDto,
		ApiError,
		{ id: string } & UpdateFolderDto
	>({
		mutationFn: async ({ id, ...body }) => {
			const { data, error, response } = await api.PATCH("/api/folders/{id}", {
				params: { path: { id } },
				body,
			});
			if (error) throw await normalizeError(response);
			return data;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["folders"] }),
	});
}

export function useDeleteFolder() {
	const queryClient = useQueryClient();
	return useMutation<void, ApiError, { id: string }>({
		mutationFn: async ({ id }) => {
			const { error, response } = await api.DELETE("/api/folders/{id}", {
				params: { path: { id } },
			});
			if (error) throw await normalizeError(response);
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["folders"] }),
	});
}
