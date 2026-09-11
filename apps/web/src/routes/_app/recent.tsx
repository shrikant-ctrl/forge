import { createFileRoute, useNavigate } from "@tanstack/react-router";
import ItemsView from "../../components/drive/ItemsView";
import ViewToggle from "../../components/drive/ViewToggle";
import { useDrive } from "../../lib/drive-store";
import { recencyBucket } from "../../lib/format";

export const Route = createFileRoute("/_app/recent")({
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
	const { recentFiles, viewMode } = useDrive();
	const navigate = useNavigate();
	const files = recentFiles();

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
