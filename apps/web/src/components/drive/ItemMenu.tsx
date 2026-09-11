import type { DriveItemKind } from "../../lib/drive-types";
import { useUiState } from "../../lib/ui-state/ui-state-store";
import {
	DotsVerticalIcon,
	DownloadIcon,
	MoveIcon,
	PencilIcon,
	TrashIcon,
} from "../icons";

function closeOpenDropdown() {
	if (document.activeElement instanceof HTMLElement)
		document.activeElement.blur();
}

export default function ItemMenu({
	kind,
	id,
	onOpen,
}: {
	kind: DriveItemKind;
	id: string;
	onOpen?: () => void;
}) {
	const { openModal } = useUiState();

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: stopPropagation guard only, not itself interactive
		// biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation guard only, not itself interactive
		<div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
			<button type="button" className="btn btn-ghost btn-square btn-xs">
				<DotsVerticalIcon className="size-4" />
			</button>
			<ul className="menu dropdown-content menu-sm z-20 w-44 rounded-box bg-base-100 p-2 shadow-lg">
				{onOpen && (
					<li>
						<button
							type="button"
							onClick={() => {
								closeOpenDropdown();
								onOpen();
							}}
						>
							Open
						</button>
					</li>
				)}
				{kind === "file" && (
					<li>
						<button type="button" onClick={closeOpenDropdown}>
							<DownloadIcon className="size-4" /> Download
						</button>
					</li>
				)}
				<li>
					<button
						type="button"
						onClick={() => {
							closeOpenDropdown();
							openModal({ type: "rename", kind, id });
						}}
					>
						<PencilIcon className="size-4" /> Rename
					</button>
				</li>
				<li>
					<button
						type="button"
						onClick={() => {
							closeOpenDropdown();
							openModal({ type: "move", kind, id });
						}}
					>
						<MoveIcon className="size-4" /> Move
					</button>
				</li>
				<li>
					<button
						type="button"
						className="text-error"
						onClick={() => {
							closeOpenDropdown();
							openModal({ type: "delete", kind, id });
						}}
					>
						<TrashIcon className="size-4" /> Delete
					</button>
				</li>
			</ul>
		</div>
	);
}
