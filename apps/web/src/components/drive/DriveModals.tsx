import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAppForm } from "../../hooks/form";
import type { ApiError } from "../../lib/api/errors";
import { useDrive } from "../../lib/drive-store";
import {
	useCreateFolder,
	useDeleteFolder,
	useUpdateFolder,
} from "../../lib/folders/mutations";
import { folderDetailQueryOptions } from "../../lib/folders/queries";
import { folderNameSchema } from "../../lib/folders/schemas";
import {
	fileExtensionLabel,
	formatBytes,
	formatRelativeDate,
} from "../../lib/format";
import { useUiState } from "../../lib/ui-state/ui-state-store";
import { DownloadIcon, FileIcon } from "../icons";
import MoveFolderTree from "./MoveFolderTree";

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
	const { closeModal } = useUiState();
	const createFolder = useCreateFolder();

	const form = useAppForm({
		defaultValues: { name: "Untitled folder" },
		validators: { onChange: folderNameSchema },
		onSubmit: async ({ value }) => {
			try {
				await createFolder.mutateAsync({ name: value.name, parentId });
				closeModal();
			} catch (err) {
				const apiErr = err as ApiError;
				form.setErrorMap({ onSubmit: { form: apiErr.message, fields: {} } });
			}
		},
	});

	return (
		<ModalShell title="New folder" onClose={closeModal}>
			<form
				className="mt-4"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<form.AppField name="name">
					{(field) => <field.TextField label="Name" />}
				</form.AppField>
				<form.AppForm>
					<form.FormError />
				</form.AppForm>
				<div className="modal-action">
					<button type="button" className="btn btn-ghost" onClick={closeModal}>
						Cancel
					</button>
					<form.AppForm>
						<form.SubmitButton label="Create" />
					</form.AppForm>
				</div>
			</form>
		</ModalShell>
	);
}

function RenameForm({
	initialName,
	onSubmit,
	onCancel,
}: {
	initialName: string;
	onSubmit: (name: string) => void;
	onCancel: () => void;
}) {
	const [name, setName] = useState(initialName);

	return (
		<form
			className="mt-4"
			onSubmit={(e) => {
				e.preventDefault();
				if (name.trim()) onSubmit(name.trim());
			}}
		>
			<input
				className="input input-bordered w-full"
				value={name}
				onChange={(e) => setName(e.target.value)}
				onFocus={(e) => e.target.select()}
			/>
			<div className="modal-action">
				<button type="button" className="btn btn-ghost" onClick={onCancel}>
					Cancel
				</button>
				<button type="submit" className="btn btn-primary">
					Save
				</button>
			</div>
		</form>
	);
}

function RenameModal({ kind, id }: { kind: "folder" | "file"; id: string }) {
	const { closeModal } = useUiState();
	const { getFile, renameItem } = useDrive();
	const updateFolder = useUpdateFolder();
	const folderDetail = useQuery({
		...folderDetailQueryOptions(id),
		enabled: kind === "folder",
	});

	const currentName =
		kind === "folder" ? folderDetail.data?.name : getFile(id)?.name;

	if (currentName === undefined) {
		return (
			<ModalShell title={`Rename ${kind}`} onClose={closeModal}>
				<div className="mt-4 flex justify-center py-4">
					<span className="loading loading-spinner" />
				</div>
			</ModalShell>
		);
	}

	function handleSubmit(name: string) {
		if (kind === "folder") updateFolder.mutate({ id, name });
		else renameItem("file", id, name);
		closeModal();
	}

	return (
		<ModalShell title={`Rename ${kind}`} onClose={closeModal}>
			<RenameForm
				initialName={currentName}
				onSubmit={handleSubmit}
				onCancel={closeModal}
			/>
		</ModalShell>
	);
}

function MoveModal({ kind, id }: { kind: "folder" | "file"; id: string }) {
	const { closeModal } = useUiState();
	const { moveItem } = useDrive();
	const updateFolder = useUpdateFolder();
	const [expanded, setExpanded] = useState<Set<string>>(new Set());
	const [destination, setDestination] = useState<string | null>(null);

	function toggle(folderId: string) {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(folderId)) next.delete(folderId);
			else next.add(folderId);
			return next;
		});
	}

	function handleSubmit() {
		if (destination === null) return;
		if (kind === "folder") updateFolder.mutate({ id, parentId: destination });
		else moveItem("file", id, destination);
		closeModal();
	}

	return (
		<ModalShell title="Move to" onClose={closeModal}>
			<p className="mt-2 text-xs text-base-content/60">
				Moving to My Drive (root) isn't supported yet.
			</p>
			<div className="mt-2 max-h-64 overflow-y-auto rounded-box border border-base-200 p-2">
				<MoveFolderTree
					parentId={null}
					depth={0}
					excludeId={id}
					expanded={expanded}
					onToggle={toggle}
					destination={destination}
					onSelect={setDestination}
				/>
			</div>
			<div className="modal-action">
				<button type="button" className="btn btn-ghost" onClick={closeModal}>
					Cancel
				</button>
				<button
					type="button"
					className="btn btn-primary"
					disabled={destination === null}
					onClick={handleSubmit}
				>
					Move
				</button>
			</div>
		</ModalShell>
	);
}

function DeleteModal({ kind, id }: { kind: "folder" | "file"; id: string }) {
	const { closeModal } = useUiState();
	const { getFile, deleteItem } = useDrive();
	const deleteFolder = useDeleteFolder();
	const folderDetail = useQuery({
		...folderDetailQueryOptions(id),
		enabled: kind === "folder",
	});

	const name = kind === "folder" ? folderDetail.data?.name : getFile(id)?.name;
	if (name === undefined) return null;

	function handleDelete() {
		if (kind === "folder") deleteFolder.mutate({ id });
		else deleteItem("file", id);
		closeModal();
	}

	return (
		<ModalShell title={`Delete ${kind}`} onClose={closeModal}>
			<div className="alert alert-warning mt-4">
				<span>"{name}" will be deleted permanently. This can't be undone.</span>
			</div>
			<div className="modal-action">
				<button type="button" className="btn btn-ghost" onClick={closeModal}>
					Cancel
				</button>
				<button type="button" className="btn btn-error" onClick={handleDelete}>
					Delete forever
				</button>
			</div>
		</ModalShell>
	);
}

function PreviewModal({ id }: { id: string }) {
	const { getFile } = useDrive();
	const { closeModal } = useUiState();
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
	const { activeModal, closeModal } = useUiState();

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
