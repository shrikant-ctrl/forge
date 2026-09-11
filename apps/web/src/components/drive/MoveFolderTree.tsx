import { useQuery } from "@tanstack/react-query";
import { foldersQueryOptions } from "../../lib/folders/queries";

interface MoveFolderTreeProps {
	parentId: string | null;
	depth: number;
	excludeId: string;
	expanded: Set<string>;
	onToggle: (id: string) => void;
	destination: string | null;
	onSelect: (id: string) => void;
}

export default function MoveFolderTree({
	parentId,
	depth,
	excludeId,
	expanded,
	onToggle,
	destination,
	onSelect,
}: MoveFolderTreeProps) {
	const query = useQuery(foldersQueryOptions(parentId));

	if (query.isPending) {
		return depth === 0 ? (
			<div className="flex justify-center py-4">
				<span className="loading loading-spinner loading-sm" />
			</div>
		) : null;
	}

	const rows = (query.data ?? []).filter((f) => f.id !== excludeId);
	if (rows.length === 0) return null;

	return (
		<ul className={depth === 0 ? "menu w-full" : ""}>
			{rows.map((folder) => (
				<li key={folder.id} style={{ paddingLeft: depth * 16 }}>
					<div className="flex items-center gap-1">
						<button
							type="button"
							className="btn btn-ghost btn-xs"
							onClick={() => onToggle(folder.id)}
						>
							{expanded.has(folder.id) ? "▾" : "▸"}
						</button>
						<button
							type="button"
							className={`flex-1 rounded px-2 py-1 text-left ${destination === folder.id ? "bg-primary/10 font-semibold" : ""}`}
							onClick={() => onSelect(folder.id)}
						>
							{folder.name}
						</button>
					</div>
					{expanded.has(folder.id) && (
						<MoveFolderTree
							parentId={folder.id}
							depth={depth + 1}
							excludeId={excludeId}
							expanded={expanded}
							onToggle={onToggle}
							destination={destination}
							onSelect={onSelect}
						/>
					)}
				</li>
			))}
		</ul>
	);
}
