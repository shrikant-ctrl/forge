import type { FileResponseDto, FolderResponseDto } from "../../lib/api/types";
import {
	fileBadgeColor,
	fileExtensionLabel,
	formatBytes,
	formatRelativeDate,
} from "../../lib/format";
import { useUiState } from "../../lib/ui-state/ui-state-store";
import { FileIcon, FolderIcon } from "../icons";
import FileLocationLabel from "./FileLocationLabel";
import ItemMenu from "./ItemMenu";

interface ItemsViewProps {
	folders: FolderResponseDto[];
	files: FileResponseDto[];
	viewMode: "grid" | "list";
	onOpenFolder: (id: string) => void;
	showPath?: boolean;
}

export default function ItemsView({
	folders,
	files,
	viewMode,
	onOpenFolder,
	showPath,
}: ItemsViewProps) {
	const { openModal } = useUiState();

	if (folders.length === 0 && files.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-base-300 py-24 text-base-content/50">
				<FolderIcon className="size-10" />
				<p className="text-sm">Nothing here yet</p>
			</div>
		);
	}

	if (viewMode === "list") {
		return (
			<div className="overflow-x-auto rounded-2xl border border-base-200">
				<table className="table">
					<thead>
						<tr>
							<th>Name</th>
							{showPath && <th>Location</th>}
							<th>Modified</th>
							<th>Size</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{folders.map((folder) => (
							<tr
								key={folder.id}
								className="cursor-pointer hover:bg-base-200"
								onClick={() => onOpenFolder(folder.id)}
							>
								<td className="flex items-center gap-2 font-medium">
									<FolderIcon className="size-5 text-primary" />
									{folder.name}
								</td>
								{showPath && (
									<td className="text-base-content/50">
										<FileLocationLabel folderId={folder.parentId} />
									</td>
								)}
								<td className="text-base-content/60">
									{formatRelativeDate(folder.updatedAt)}
								</td>
								<td className="text-base-content/60">&mdash;</td>
								{/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation guard only, ItemMenu inside is independently keyboard-operable */}
								<td onClick={(e) => e.stopPropagation()}>
									<ItemMenu
										kind="folder"
										id={folder.id}
										onOpen={() => onOpenFolder(folder.id)}
									/>
								</td>
							</tr>
						))}
						{files.map((file) => (
							<tr
								key={file.id}
								className="cursor-pointer hover:bg-base-200"
								onClick={() => openModal({ type: "preview", id: file.id })}
							>
								<td className="flex items-center gap-2 font-medium">
									<FileIcon className="size-5 text-base-content/60" />
									{file.name}
								</td>
								{showPath && (
									<td className="text-base-content/50">
										<FileLocationLabel folderId={file.folderId} />
									</td>
								)}
								<td className="text-base-content/60">
									{formatRelativeDate(file.updatedAt)}
								</td>
								<td className="text-base-content/60">
									{formatBytes(file.sizeBytes)}
								</td>
								{/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation guard only, ItemMenu inside is independently keyboard-operable */}
								<td onClick={(e) => e.stopPropagation()}>
									<ItemMenu
										kind="file"
										id={file.id}
										onOpen={() => openModal({ type: "preview", id: file.id })}
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{folders.map((folder) => (
				// biome-ignore lint/a11y/useSemanticElements: card contains a nested interactive ItemMenu button, so it cannot itself be a <button>
				<div
					key={folder.id}
					role="button"
					tabIndex={0}
					onClick={() => onOpenFolder(folder.id)}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							onOpenFolder(folder.id);
						}
					}}
					className="card cursor-pointer border border-base-200 bg-base-100 text-left shadow-sm transition hover:shadow-md"
				>
					<div className="card-body gap-2 p-4">
						<div className="flex items-start justify-between">
							<FolderIcon className="size-8 text-primary" />
							<ItemMenu
								kind="folder"
								id={folder.id}
								onOpen={() => onOpenFolder(folder.id)}
							/>
						</div>
						<p className="truncate text-sm font-semibold">{folder.name}</p>
						<p className="text-xs text-base-content/50">
							{formatRelativeDate(folder.updatedAt)}
						</p>
					</div>
				</div>
			))}
			{files.map((file) => (
				// biome-ignore lint/a11y/useSemanticElements: card contains a nested interactive ItemMenu button, so it cannot itself be a <button>
				<div
					key={file.id}
					role="button"
					tabIndex={0}
					onClick={() => openModal({ type: "preview", id: file.id })}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							openModal({ type: "preview", id: file.id });
						}
					}}
					className="card cursor-pointer border border-base-200 bg-base-100 text-left shadow-sm transition hover:shadow-md"
				>
					<div className="card-body gap-2 p-4">
						<div className="flex items-start justify-between">
							<FileIcon className="size-8 text-base-content/60" />
							<ItemMenu
								kind="file"
								id={file.id}
								onOpen={() => openModal({ type: "preview", id: file.id })}
							/>
						</div>
						<p className="truncate text-sm font-semibold">{file.name}</p>
						<div className="flex items-center gap-2">
							<span
								className={`badge badge-sm ${fileBadgeColor(file.mimeType)}`}
							>
								{fileExtensionLabel(file.mimeType)}
							</span>
							<span className="text-xs text-base-content/50">
								{formatBytes(file.sizeBytes)}
							</span>
						</div>
						{showPath && (
							<p className="truncate text-xs text-base-content/40">
								<FileLocationLabel folderId={file.folderId} />
							</p>
						)}
					</div>
				</div>
			))}
		</div>
	);
}
