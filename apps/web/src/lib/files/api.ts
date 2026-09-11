import { api } from "../api/client";
import { normalizeError } from "../api/errors";
import type {
	FileResponseDto,
	InitUploadDto,
	InitUploadResponseDto,
} from "../api/types";

export async function initUpload(
	body: InitUploadDto,
): Promise<InitUploadResponseDto> {
	const { data, error, response } = await api.POST("/api/files/init-upload", {
		body,
	});
	if (error) throw await normalizeError(response);
	return data;
}

export async function completeUpload(fileId: string): Promise<FileResponseDto> {
	const { data, error, response } = await api.POST(
		"/api/files/complete-upload",
		{ body: { fileId } },
	);
	if (error) throw await normalizeError(response);
	return data;
}
