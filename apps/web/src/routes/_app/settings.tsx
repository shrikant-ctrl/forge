import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import ThemeToggle from "../../components/ThemeToggle";
import { meQueryOptions } from "../../lib/auth/queries";
import { formatBytes } from "../../lib/format";

export const Route = createFileRoute("/_app/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const { data: user } = useSuspenseQuery(meQueryOptions);
	const usedPct = Math.min(
		100,
		Math.round((user.usedStorage / user.storageQuota) * 100),
	);

	return (
		<div className="mx-auto flex max-w-2xl flex-col gap-6">
			<h1 className="text-xl font-bold">Settings</h1>

			<section className="card border border-base-200 bg-base-100">
				<div className="card-body gap-4">
					<h2 className="card-title text-base">Profile</h2>
					<div className="flex items-center gap-4">
						<div className="avatar avatar-placeholder">
							<div className="w-16 rounded-full bg-neutral text-neutral-content">
								<span className="text-xl">{user.name.charAt(0)}</span>
							</div>
						</div>
						<div>
							<p className="font-semibold">{user.name}</p>
							<p className="text-sm text-base-content/60">{user.email}</p>
						</div>
					</div>
				</div>
			</section>

			<section className="card border border-base-200 bg-base-100">
				<div className="card-body gap-4">
					<h2 className="card-title text-base">Storage</h2>
					<div className="stats bg-base-100">
						<div className="stat px-0">
							<div className="stat-title">Used</div>
							<div className="stat-value text-2xl">
								{formatBytes(user.usedStorage)}
							</div>
							<div className="stat-desc">
								of {formatBytes(user.storageQuota)} total
							</div>
						</div>
					</div>
					<progress
						className="progress progress-primary w-full"
						value={usedPct}
						max={100}
					/>
				</div>
			</section>

			<section className="card border border-base-200 bg-base-100">
				<div className="card-body flex-row items-center justify-between">
					<div>
						<h2 className="card-title text-base">Appearance</h2>
						<p className="text-sm text-base-content/60">
							Switch between light, dark, or system theme.
						</p>
					</div>
					<ThemeToggle />
				</div>
			</section>
		</div>
	);
}
