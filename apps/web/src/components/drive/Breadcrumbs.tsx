import { useQuery } from "@tanstack/react-query";
import { folderDetailQueryOptions } from "../../lib/folders/queries";

export default function Breadcrumbs({
	folderId,
	onNavigate,
}: {
	folderId: string | null;
	onNavigate: (id: string | null) => void;
}) {
	const detail = useQuery({
		...folderDetailQueryOptions(folderId ?? ""),
		enabled: folderId !== null,
	});
	const trail =
		folderId !== null && detail.data
			? [
					...detail.data.breadcrumbs,
					{ id: detail.data.id, name: detail.data.name },
				]
			: [];

	return (
		<div className="breadcrumbs text-sm">
			<ul>
				<li>
					<button
						type="button"
						onClick={() => onNavigate(null)}
						className="font-semibold"
					>
						My Drive
					</button>
				</li>
				{trail.map((folder, index) => (
					<li key={folder.id}>
						<button
							type="button"
							onClick={() => onNavigate(folder.id)}
							className={index === trail.length - 1 ? "font-semibold" : ""}
						>
							{folder.name}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
