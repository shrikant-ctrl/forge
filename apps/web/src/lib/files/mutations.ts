import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { type ApiError, normalizeError } from "../api/errors";
import type {
	DownloadUrlResponseDto,
	FileResponseDto,
	UpdateFileDto,
} from "../api/types";

export function useUpdateFile() {
	const queryClient = useQueryClient();
	return useMutation<FileResponseDto, ApiError, { id: string } & UpdateFileDto>(
		{
			mutationFn: async ({ id, ...body }) => {
				const { data, error, response } = await api.PATCH("/api/files/{id}", {
					params: { path: { id } },
					body,
				});
				if (error) throw await normalizeError(response);
				return data;
			},
			onSuccess: () => queryClient.invalidateQueries({ queryKey: ["files"] }),
		},
	);
}

export function useDeleteFile() {
	const queryClient = useQueryClient();
	return useMutation<void, ApiError, { id: string }>({
		mutationFn: async ({ id }) => {
			const { error, response } = await api.DELETE("/api/files/{id}", {
				params: { path: { id } },
			});
			if (error) throw await normalizeError(response);
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["files"] }),
	});
}

// Modeled as a mutation despite being a GET — it's a one-off action with a
// short-lived result, not cacheable server state worth a query key.
export function useDownloadFile() {
	return useMutation<DownloadUrlResponseDto, ApiError, { id: string }>({
		mutationFn: async ({ id }) => {
			const { data, error, response } = await api.GET(
				"/api/files/{id}/download-url",
				{ params: { path: { id } } },
			);
			if (error) throw await normalizeError(response);
			return data;
		},
		onSuccess: (data) => window.location.assign(data.downloadUrl),
	});
}
