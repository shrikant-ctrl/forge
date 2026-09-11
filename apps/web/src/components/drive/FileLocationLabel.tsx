import { useQuery } from "@tanstack/react-query";
import { folderDetailQueryOptions } from "../../lib/folders/queries";

export default function FileLocationLabel({
	folderId,
}: {
	folderId: string | null;
}) {
	const detail = useQuery({
		...folderDetailQueryOptions(folderId ?? ""),
		enabled: folderId !== null,
	});

	if (folderId === null) return <>My Drive</>;
	if (!detail.data) return null;

	const trail = [
		...detail.data.breadcrumbs,
		{ id: detail.data.id, name: detail.data.name },
	];
	return <>My Drive / {trail.map((f) => f.name).join(" / ")}</>;
}
