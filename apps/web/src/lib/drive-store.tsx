import type { ReactNode } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import type {
	DriveFile,
	DriveFolder,
	DriveItemKind,
	DriveModalState,
	UploadTask,
	ViewMode,
} from "./drive-types";
import {
	createInitialFiles,
	createInitialFolders,
	mockUser,
} from "./mock-drive-data";

interface DriveContextValue {
	folders: DriveFolder[];
	files: DriveFile[];
	uploads: UploadTask[];
	viewMode: ViewMode;
	setViewMode: (mode: ViewMode) => void;
	activeModal: DriveModalState;
	openModal: (modal: DriveModalState) => void;
	closeModal: () => void;
	childFolders: (parentId: string | null) => DriveFolder[];
	childFiles: (folderId: string | null) => DriveFile[];
	breadcrumb: (folderId: string | null) => DriveFolder[];
	recentFiles: () => DriveFile[];
	searchFiles: (query: string) => DriveFile[];
	getFolder: (id: string) => DriveFolder | undefined;
	getFile: (id: string) => DriveFile | undefined;
	createFolder: (name: string, parentId: string | null) => void;
	renameItem: (kind: DriveItemKind, id: string, name: string) => void;
	moveItem: (kind: DriveItemKind, id: string, parentId: string | null) => void;
	deleteItem: (kind: DriveItemKind, id: string) => void;
	startUpload: (fileList: FileList, folderId: string | null) => void;
	usedStorageBytes: number;
	storageQuotaBytes: number;
	user: typeof mockUser;
}

const DriveContext = createContext<DriveContextValue | null>(null);

function newId(prefix: string): string {
	return `${prefix}-${crypto.randomUUID()}`;
}

export function DriveProvider({ children }: { children: ReactNode }) {
	const [folders, setFolders] = useState<DriveFolder[]>(createInitialFolders);
	const [files, setFiles] = useState<DriveFile[]>(createInitialFiles);
	const [uploads, setUploads] = useState<UploadTask[]>([]);
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [activeModal, setActiveModal] = useState<DriveModalState>(null);

	const getFolder = useCallback(
		(id: string) => folders.find((f) => f.id === id),
		[folders],
	);
	const getFile = useCallback(
		(id: string) => files.find((f) => f.id === id),
		[files],
	);

	const childFolders = useCallback(
		(parentId: string | null) =>
			folders
				.filter((f) => f.parentId === parentId)
				.sort((a, b) => a.name.localeCompare(b.name)),
		[folders],
	);

	const childFiles = useCallback(
		(folderId: string | null) =>
			files
				.filter((f) => f.folderId === folderId)
				.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
		[files],
	);

	const breadcrumb = useCallback(
		(folderId: string | null) => {
			const trail: DriveFolder[] = [];
			let current = folderId
				? folders.find((f) => f.id === folderId)
				: undefined;
			while (current) {
				trail.unshift(current);
				current = current.parentId
					? folders.find((f) => f.id === current?.parentId)
					: undefined;
			}
			return trail;
		},
		[folders],
	);

	const recentFiles = useCallback(
		() => [...files].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
		[files],
	);

	const searchFiles = useCallback(
		(query: string) => {
			const q = query.trim().toLowerCase();
			if (!q) return [];
			return files
				.filter((f) => f.name.toLowerCase().includes(q))
				.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
		},
		[files],
	);

	const createFolder = useCallback((name: string, parentId: string | null) => {
		const now = new Date().toISOString();
		setFolders((prev) => [
			...prev,
			{ id: newId("folder"), name, parentId, createdAt: now, updatedAt: now },
		]);
	}, []);

	const renameItem = useCallback(
		(kind: DriveItemKind, id: string, name: string) => {
			const now = new Date().toISOString();
			if (kind === "folder") {
				setFolders((prev) =>
					prev.map((f) => (f.id === id ? { ...f, name, updatedAt: now } : f)),
				);
			} else {
				setFiles((prev) =>
					prev.map((f) => (f.id === id ? { ...f, name, updatedAt: now } : f)),
				);
			}
		},
		[],
	);

	const moveItem = useCallback(
		(kind: DriveItemKind, id: string, parentId: string | null) => {
			const now = new Date().toISOString();
			if (kind === "folder") {
				setFolders((prev) =>
					prev.map((f) =>
						f.id === id ? { ...f, parentId, updatedAt: now } : f,
					),
				);
			} else {
				setFiles((prev) =>
					prev.map((f) =>
						f.id === id ? { ...f, folderId: parentId, updatedAt: now } : f,
					),
				);
			}
		},
		[],
	);

	const deleteItem = useCallback((kind: DriveItemKind, id: string) => {
		if (kind === "folder") {
			setFolders((prev) => prev.filter((f) => f.id !== id));
		} else {
			setFiles((prev) => prev.filter((f) => f.id !== id));
		}
	}, []);

	const startUpload = useCallback(
		(fileList: FileList, folderId: string | null) => {
			Array.from(fileList).forEach((file) => {
				const id = newId("upload");
				setUploads((prev) => [
					...prev,
					{
						id,
						name: file.name,
						sizeBytes: file.size,
						progress: 0,
						status: "uploading",
					},
				]);

				const interval = setInterval(() => {
					setUploads((prev) =>
						prev.map((task) => {
							if (task.id !== id || task.status !== "uploading") return task;
							const nextProgress = Math.min(
								100,
								task.progress + 15 + Math.random() * 15,
							);
							return { ...task, progress: nextProgress };
						}),
					);
				}, 250);

				setTimeout(() => {
					clearInterval(interval);
					setUploads((prev) =>
						prev.map((task) =>
							task.id === id
								? { ...task, progress: 100, status: "done" }
								: task,
						),
					);
					const now = new Date().toISOString();
					setFiles((prev) => [
						...prev,
						{
							id: newId("file"),
							name: file.name,
							folderId,
							sizeBytes: file.size,
							mimeType: file.type || "application/octet-stream",
							createdAt: now,
							updatedAt: now,
						},
					]);
				}, 1500);
			});
		},
		[],
	);

	const usedStorageBytes = useMemo(
		() => files.reduce((sum, f) => sum + f.sizeBytes, 0),
		[files],
	);

	const value = useMemo<DriveContextValue>(
		() => ({
			folders,
			files,
			uploads,
			viewMode,
			setViewMode,
			activeModal,
			openModal: setActiveModal,
			closeModal: () => setActiveModal(null),
			childFolders,
			childFiles,
			breadcrumb,
			recentFiles,
			searchFiles,
			getFolder,
			getFile,
			createFolder,
			renameItem,
			moveItem,
			deleteItem,
			startUpload,
			usedStorageBytes,
			storageQuotaBytes: mockUser.storageQuotaBytes,
			user: mockUser,
		}),
		[
			folders,
			files,
			uploads,
			viewMode,
			activeModal,
			childFolders,
			childFiles,
			breadcrumb,
			recentFiles,
			searchFiles,
			getFolder,
			getFile,
			createFolder,
			renameItem,
			moveItem,
			deleteItem,
			startUpload,
			usedStorageBytes,
		],
	);

	return (
		<DriveContext.Provider value={value}>{children}</DriveContext.Provider>
	);
}

export function useDrive(): DriveContextValue {
	const ctx = useContext(DriveContext);
	if (!ctx) throw new Error("useDrive must be used within DriveProvider");
	return ctx;
}
