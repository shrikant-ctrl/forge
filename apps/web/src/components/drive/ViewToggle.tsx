import { useDrive } from "../../lib/drive-store";
import { GridIcon, ListIcon } from "../icons";

export default function ViewToggle() {
	const { viewMode, setViewMode } = useDrive();

	return (
		<div className="join">
			<button
				type="button"
				className={`btn join-item btn-sm ${viewMode === "grid" ? "btn-active" : ""}`}
				aria-label="Grid view"
				onClick={() => setViewMode("grid")}
			>
				<GridIcon className="size-4" />
			</button>
			<button
				type="button"
				className={`btn join-item btn-sm ${viewMode === "list" ? "btn-active" : ""}`}
				aria-label="List view"
				onClick={() => setViewMode("list")}
			>
				<ListIcon className="size-4" />
			</button>
		</div>
	);
}
