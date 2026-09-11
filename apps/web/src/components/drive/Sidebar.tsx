import { Link, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import { useDrive } from "../../lib/drive-store";
import { formatBytes } from "../../lib/format";
import { ClockIcon, FolderIcon, PlusIcon, UploadIcon } from "../icons";

export default function Sidebar() {
	const { usedStorageBytes, storageQuotaBytes, startUpload, openModal } =
		useDrive();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();
	const usedPct = Math.min(
		100,
		Math.round((usedStorageBytes / storageQuotaBytes) * 100),
	);

	return (
		<aside className="flex h-full w-64 shrink-0 flex-col gap-4 border-r border-base-200 bg-base-100 p-4">
			<div className="dropdown">
				<button
					type="button"
					className="btn btn-primary w-full justify-start gap-2 rounded-full shadow-sm"
				>
					<PlusIcon className="size-5" />
					New
				</button>
				<ul className="menu dropdown-content menu-sm z-10 mt-2 w-52 rounded-box bg-base-100 p-2 shadow-lg">
					<li>
						<button type="button" onClick={() => fileInputRef.current?.click()}>
							<UploadIcon className="size-4" /> Upload file(s)
						</button>
					</li>
					<li>
						<button
							type="button"
							onClick={() => {
								navigate({ to: "/drive" });
								openModal({ type: "new-folder", parentId: null });
							}}
						>
							<FolderIcon className="size-4" /> New folder
						</button>
					</li>
				</ul>
			</div>
			<input
				ref={fileInputRef}
				type="file"
				multiple
				className="hidden"
				onChange={(e) => {
					if (e.target.files?.length) {
						startUpload(e.target.files, null);
						navigate({ to: "/drive" });
					}
					e.target.value = "";
				}}
			/>

			<nav className="menu w-full gap-1 p-0">
				<li>
					<Link
						to="/drive"
						activeProps={{ className: "menu-active" }}
						activeOptions={{ exact: true }}
					>
						<FolderIcon className="size-5" />
						My Drive
					</Link>
				</li>
				<li>
					<Link to="/recent" activeProps={{ className: "menu-active" }}>
						<ClockIcon className="size-5" />
						Recent
					</Link>
				</li>
			</nav>

			<div className="mt-auto rounded-2xl bg-base-200 p-4">
				<p className="mb-1.5 text-xs font-semibold text-base-content/70">
					Storage
				</p>
				<progress
					className="progress progress-primary w-full"
					value={usedPct}
					max={100}
				/>
				<p className="mt-1.5 text-xs text-base-content/60">
					{formatBytes(usedStorageBytes)} of {formatBytes(storageQuotaBytes)}{" "}
					used
				</p>
			</div>
		</aside>
	);
}
