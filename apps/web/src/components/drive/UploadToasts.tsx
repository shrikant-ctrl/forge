import { useDrive } from "../../lib/drive-store";
import { formatBytes } from "../../lib/format";

export default function UploadToasts() {
	const { uploads } = useDrive();
	const active = uploads.slice(-5);

	if (active.length === 0) return null;

	return (
		<div className="toast toast-end toast-bottom z-50 w-80">
			<div className="w-full rounded-2xl border border-base-200 bg-base-100 p-3 shadow-xl">
				<p className="mb-2 px-1 text-xs font-semibold text-base-content/70">
					{active.every((u) => u.status === "done")
						? "Uploads complete"
						: `Uploading ${active.length} item(s)`}
				</p>
				<ul className="flex flex-col gap-2">
					{active.map((task) => (
						<li key={task.id} className="rounded-lg px-1">
							<div className="flex items-center justify-between text-xs">
								<span className="truncate pr-2">{task.name}</span>
								<span className="shrink-0 text-base-content/50">
									{formatBytes(task.sizeBytes)}
								</span>
							</div>
							{task.status === "done" ? (
								<div className="badge badge-success badge-sm mt-1">Done</div>
							) : (
								<progress
									className="progress progress-primary mt-1 w-full"
									value={task.progress}
									max={100}
								/>
							)}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
