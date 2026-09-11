import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useDrive } from "../../lib/drive-store";
import {
	fileExtensionLabel,
	formatBytes,
	formatRelativeDate,
} from "../../lib/format";
import { DownloadIcon, FileIcon } from "../icons";

function ModalShell({
	title,
	onClose,
	children,
}: {
	title: string;
	onClose: () => void;
	children: ReactNode;
}) {
	return (
		<div className="modal modal-open">
			<div className="modal-box">
				<h3 className="text-lg font-bold">{title}</h3>
				{children}
			</div>
			<button
				type="button"
				className="modal-backdrop cursor-pointer"
				aria-label="Close"
				onClick={onClose}
			>
				<span className="sr-only">Close</span>
			</button>
		</div>
	);
}

function NewFolderModal({ parentId }: { parentId: string | null }) {
	const { createFolder, closeModal } = useDrive();
	const [name, setName] = useState("Untitled folder");

	return (
		<ModalShell title="New folder" onClose={closeModal}>
			<form
				className="mt-4"
				onSubmit={(e) => {
					e.preventDefault();
					if (name.trim()) createFolder(name.trim(), parentId);
					closeModal();
				}}
			>
				<input
					className="input input-bordered w-full"
					value={name}
					onChange={(e) => setName(e.target.value)}
					onFocus={(e) => e.target.select()}
				/>
				<div className="modal-action">
					<button type="button" className="btn btn-ghost" onClick={closeModal}>
						Cancel
					</button>
					<button type="submit" className="btn btn-primary">
						Create
					</button>
				</div>
			</form>
		</ModalShell>
	);
}

function RenameModal({ kind, id }: { kind: "folder" | "file"; id: string }) {
	const { getFolder, getFile, renameItem, closeModal } = useDrive();
	const item = kind === "folder" ? getFolder(id) : getFile(id);
	const [name, setName] = useState(item?.name ?? "");

	if (!item) return null;

	return (
		<ModalShell title={`Rename ${kind}`} onClose={closeModal}>
			<form
				className="mt-4"
				onSubmit={(e) => {
					e.preventDefault();
					if (name.trim()) renameItem(kind, id, name.trim());
					closeModal();
				}}
			>
				<input
					className="input input-bordered w-full"
					value={name}
					onChange={(e) => setName(e.target.value)}
					onFocus={(e) => e.target.select()}
				/>
				<div className="modal-action">
					<button type="button" className="btn btn-ghost" onClick={closeModal}>
						Cancel
					</button>
					<button type="submit" className="btn btn-primary">
						Save
					</button>
				</div>
			</form>
		</ModalShell>
	);
}

function MoveModal({ kind, id }: { kind: "folder" | "file"; id: string }) {
	const { folders, moveItem, closeModal, breadcrumb } = useDrive();
	const eligibleFolders = folders.filter((f) => f.id !== id);
	const [destination, setDestination] = useState<string>("");

	return (
		<ModalShell title="Move to" onClose={closeModal}>
			<form
				className="mt-4"
				onSubmit={(e) => {
					e.preventDefault();
					moveItem(kind, id, destination || null);
					closeModal();
				}}
			>
				<select
					className="select select-bordered w-full"
					value={destination}
					onChange={(e) => setDestination(e.target.value)}
				>
					<option value="">My Drive (root)</option>
					{eligibleFolders.map((f) => (
						<option key={f.id} value={f.id}>
							{"  ".repeat(breadcrumb(f.id).length - 1)}
							{f.name}
						</option>
					))}
				</select>
				<div className="modal-action">
					<button type="button" className="btn btn-ghost" onClick={closeModal}>
						Cancel
					</button>
					<button type="submit" className="btn btn-primary">
						Move
					</button>
				</div>
			</form>
		</ModalShell>
	);
}

function DeleteModal({ kind, id }: { kind: "folder" | "file"; id: string }) {
	const { getFolder, getFile, deleteItem, closeModal } = useDrive();
	const item = kind === "folder" ? getFolder(id) : getFile(id);
	if (!item) return null;

	return (
		<ModalShell title={`Delete ${kind}`} onClose={closeModal}>
			<div className="alert alert-warning mt-4">
				<span>
					"{item.name}" will be deleted permanently. This can't be undone.
				</span>
			</div>
			<div className="modal-action">
				<button type="button" className="btn btn-ghost" onClick={closeModal}>
					Cancel
				</button>
				<button
					type="button"
					className="btn btn-error"
					onClick={() => {
						deleteItem(kind, id);
						closeModal();
					}}
				>
					Delete forever
				</button>
			</div>
		</ModalShell>
	);
}

function PreviewModal({ id }: { id: string }) {
	const { getFile, closeModal } = useDrive();
	const file = getFile(id);
	if (!file) return null;

	return (
		<div className="modal modal-open">
			<div className="modal-box max-w-2xl">
				<div className="mb-4 flex items-start justify-between gap-4">
					<div>
						<h3 className="text-lg font-bold">{file.name}</h3>
						<p className="text-xs text-base-content/60">
							{formatBytes(file.sizeBytes)} &middot; Modified{" "}
							{formatRelativeDate(file.updatedAt)}
						</p>
					</div>
					<button
						type="button"
						className="btn btn-ghost btn-sm"
						onClick={closeModal}
					>
						<DownloadIcon className="size-4" /> Download
					</button>
				</div>
				<div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl bg-base-200 text-base-content/50">
					<FileIcon className="size-16" />
					<p className="text-sm">
						No preview available &mdash; not connected to file storage yet
					</p>
					<span className="badge badge-outline">
						{fileExtensionLabel(file.mimeType)}
					</span>
				</div>
			</div>
			<button
				type="button"
				className="modal-backdrop cursor-pointer"
				aria-label="Close"
				onClick={closeModal}
			>
				<span className="sr-only">Close</span>
			</button>
		</div>
	);
}

export default function DriveModals() {
	const { activeModal, closeModal } = useDrive();

	useEffect(() => {
		if (!activeModal) return;
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") closeModal();
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [activeModal, closeModal]);

	if (!activeModal) return null;

	switch (activeModal.type) {
		case "new-folder":
			return <NewFolderModal parentId={activeModal.parentId} />;
		case "rename":
			return <RenameModal kind={activeModal.kind} id={activeModal.id} />;
		case "move":
			return <MoveModal kind={activeModal.kind} id={activeModal.id} />;
		case "delete":
			return <DeleteModal kind={activeModal.kind} id={activeModal.id} />;
		case "preview":
			return <PreviewModal id={activeModal.id} />;
		default:
			return null;
	}
}
