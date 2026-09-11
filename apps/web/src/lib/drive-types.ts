export interface DriveFolder {
	id: string;
	name: string;
	parentId: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface DriveFile {
	id: string;
	name: string;
	folderId: string | null;
	sizeBytes: number;
	mimeType: string;
	createdAt: string;
	updatedAt: string;
}

export type DriveItemKind = "folder" | "file";

export type DriveModalState =
	| { type: "new-folder"; parentId: string | null }
	| { type: "rename"; kind: DriveItemKind; id: string }
	| { type: "move"; kind: DriveItemKind; id: string }
	| { type: "delete"; kind: DriveItemKind; id: string }
	| { type: "preview"; id: string }
	| null;

export type ViewMode = "grid" | "list";

export interface UploadTask {
	id: string;
	name: string;
	sizeBytes: number;
	progress: number;
	status: "uploading" | "done" | "error";
}
