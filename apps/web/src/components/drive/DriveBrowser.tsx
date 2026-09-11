import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useDrive } from "../../lib/drive-store";
import { foldersQueryOptions } from "../../lib/folders/queries";
import { useUiState } from "../../lib/ui-state/ui-state-store";
import { PlusIcon } from "../icons";
import Breadcrumbs from "./Breadcrumbs";
import ItemsView from "./ItemsView";
import ViewToggle from "./ViewToggle";

export default function DriveBrowser({
	folderId,
}: {
	folderId: string | null;
}) {
	const { childFiles, startUpload } = useDrive();
	const { viewMode, openModal } = useUiState();
	const foldersQuery = useSuspenseQuery(foldersQueryOptions(folderId));
	const navigate = useNavigate();
	const [isDragOver, setIsDragOver] = useState(false);

	function goTo(id: string | null) {
		navigate({
			to: id ? "/drive/$folderId" : "/drive",
			params: id ? { folderId: id } : undefined,
		});
	}

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop dropzone; the Sidebar "Upload" button is the keyboard-accessible equivalent
		<div
			className={`flex min-h-full flex-col gap-4 rounded-2xl p-2 transition ${isDragOver ? "drop-target" : ""}`}
			onDragOver={(e) => {
				e.preventDefault();
				setIsDragOver(true);
			}}
			onDragLeave={() => setIsDragOver(false)}
			onDrop={(e) => {
				e.preventDefault();
				setIsDragOver(false);
				if (e.dataTransfer.files.length)
					startUpload(e.dataTransfer.files, folderId);
			}}
		>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<Breadcrumbs folderId={folderId} onNavigate={goTo} />
				<div className="flex items-center gap-2">
					<button
						type="button"
						className="btn btn-ghost btn-sm gap-1"
						onClick={() =>
							openModal({ type: "new-folder", parentId: folderId })
						}
					>
						<PlusIcon className="size-4" /> New folder
					</button>
					<ViewToggle />
				</div>
			</div>

			<ItemsView
				folders={foldersQuery.data}
				files={childFiles(folderId)}
				viewMode={viewMode}
				onOpenFolder={goTo}
			/>

			{isDragOver && (
				<div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-base-100/60 text-lg font-semibold text-primary">
					Drop to upload
				</div>
			)}
		</div>
	);
}
