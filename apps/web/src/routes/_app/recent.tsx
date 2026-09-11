import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import ItemsView from "../../components/drive/ItemsView";
import ViewToggle from "../../components/drive/ViewToggle";
import { allFilesQueryOptions } from "../../lib/files/queries";
import { recencyBucket } from "../../lib/format";
import { useUiState } from "../../lib/ui-state/ui-state-store";

export const Route = createFileRoute("/_app/recent")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(allFilesQueryOptions());
	},
	component: RecentPage,
});

const BUCKET_ORDER = [
	"Today",
	"Yesterday",
	"Earlier this week",
	"Earlier this month",
	"Earlier",
];

function RecentPage() {
	const filesQuery = useSuspenseQuery(allFilesQueryOptions());
	const { viewMode } = useUiState();
	const navigate = useNavigate();
	const files = filesQuery.data;

	const buckets = new Map<string, typeof files>();
	for (const file of files) {
		const bucket = recencyBucket(file.updatedAt);
		buckets.set(bucket, [...(buckets.get(bucket) ?? []), file]);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">Recent</h1>
				<ViewToggle />
			</div>

			{files.length === 0 && (
				<p className="text-base-content/60">No files yet.</p>
			)}

			{BUCKET_ORDER.filter((bucket) => buckets.has(bucket)).map((bucket) => (
				<section key={bucket} className="flex flex-col gap-2">
					<div className="divider divider-start text-xs font-semibold text-base-content/50">
						{bucket}
					</div>
					<ItemsView
						folders={[]}
						files={buckets.get(bucket) ?? []}
						viewMode={viewMode}
						onOpenFolder={(id) =>
							navigate({ to: "/drive/$folderId", params: { folderId: id } })
						}
						showPath
					/>
				</section>
			))}
		</div>
	);
}
