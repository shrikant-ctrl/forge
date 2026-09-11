import { useDrive } from "../../lib/drive-store";
import type { DriveFolder } from "../../lib/drive-types";

export default function Breadcrumbs({
	folderId,
	onNavigate,
}: {
	folderId: string | null;
	onNavigate: (id: string | null) => void;
}) {
	const { breadcrumb } = useDrive();
	const trail: DriveFolder[] = folderId ? breadcrumb(folderId) : [];

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
