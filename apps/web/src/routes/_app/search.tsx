import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import ItemsView from "../../components/drive/ItemsView";
import ViewToggle from "../../components/drive/ViewToggle";
import { useDrive } from "../../lib/drive-store";

const searchParamsSchema = z.object({
	q: z.string().catch(""),
});

export const Route = createFileRoute("/_app/search")({
	validateSearch: searchParamsSchema,
	component: SearchPage,
});

function SearchPage() {
	const { q } = Route.useSearch();
	const { searchFiles, viewMode } = useDrive();
	const navigate = useNavigate();
	const results = searchFiles(q);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">
					{q ? (
						<>
							Results for{" "}
							<span className="text-primary">&ldquo;{q}&rdquo;</span>
						</>
					) : (
						"Search"
					)}
				</h1>
				<ViewToggle />
			</div>

			{!q && (
				<p className="text-base-content/60">
					Type in the search bar above to find files.
				</p>
			)}
			{q && results.length === 0 && (
				<p className="text-base-content/60">
					No files match &ldquo;{q}&rdquo;.
				</p>
			)}

			{results.length > 0 && (
				<ItemsView
					folders={[]}
					files={results}
					viewMode={viewMode}
					onOpenFolder={(id) =>
						navigate({ to: "/drive/$folderId", params: { folderId: id } })
					}
					showPath
				/>
			)}
		</div>
	);
}
