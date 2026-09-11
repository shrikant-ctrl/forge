import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import type { UploadTask } from "../drive-types";
import { completeUpload, initUpload } from "../files/api";
import { putToPresignedUrl } from "./xhr-put";

interface UploadsContextValue {
	tasks: UploadTask[];
	startUpload: (fileList: FileList, folderId: string | null) => void;
}

const UploadsContext = createContext<UploadsContextValue | null>(null);

export function UploadsProvider({ children }: { children: ReactNode }) {
	const [tasks, setTasks] = useState<UploadTask[]>([]);
	const queryClient = useQueryClient();

	function updateTask(id: string, patch: Partial<UploadTask>) {
		setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
	}

	async function uploadOne(file: File, folderId: string | null) {
		const id = crypto.randomUUID();
		// computed once, reused for both init-upload and the PUT header
		const mimeType = file.type || "application/octet-stream";
		setTasks((prev) => [
			...prev,
			{
				id,
				name: file.name,
				sizeBytes: file.size,
				progress: 0,
				status: "uploading",
			},
		]);
		try {
			const init = await initUpload({
				name: file.name,
				sizeBytes: file.size,
				mimeType,
				folderId,
			});
			await putToPresignedUrl(init.uploadUrl, file, mimeType, (pct) =>
				updateTask(id, { progress: pct }),
			);
			await completeUpload(init.fileId);
			updateTask(id, { progress: 100, status: "done" });
			queryClient.invalidateQueries({ queryKey: ["files"] });
			queryClient.invalidateQueries({ queryKey: ["auth", "me"] }); // usedStorage changed
		} catch {
			updateTask(id, { status: "error" });
		}
	}

	function startUpload(fileList: FileList, folderId: string | null) {
		for (const file of Array.from(fileList)) uploadOne(file, folderId);
	}

	return (
		<UploadsContext.Provider value={{ tasks, startUpload }}>
			{children}
		</UploadsContext.Provider>
	);
}

export function useUploads() {
	const ctx = useContext(UploadsContext);
	if (!ctx) throw new Error("useUploads must be used within UploadsProvider");
	return ctx;
}
