import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import DriveModals from "../components/drive/DriveModals";
import Navbar from "../components/drive/Navbar";
import Sidebar from "../components/drive/Sidebar";
import UploadToasts from "../components/drive/UploadToasts";
import { meQueryOptions } from "../lib/auth/queries";
import { DriveProvider } from "../lib/drive-store";
import { UiStateProvider } from "../lib/ui-state/ui-state-store";

export const Route = createFileRoute("/_app")({
	// ponytail: the backend is Bearer-header-only (no cookies), so the token
	// lives in browser localStorage and the server can never see it. Running
	// this guard during SSR would always look logged-out and wrongly bounce an
	// actually-authenticated user on every hard reload — ssr:false defers the
	// whole route (guard included) to the client, where the real token is
	// visible.
	ssr: false,
	beforeLoad: async ({ context }) => {
		try {
			await context.queryClient.ensureQueryData(meQueryOptions);
		} catch {
			throw redirect({ to: "/login" });
		}
	},
	component: AppLayout,
});

function AppLayout() {
	return (
		<UiStateProvider>
			<DriveProvider>
				<div className="flex h-screen flex-col">
					<Navbar />
					<div className="flex min-h-0 flex-1">
						<Sidebar />
						<main className="min-h-0 flex-1 overflow-y-auto p-6">
							<Outlet />
						</main>
					</div>
				</div>
				<DriveModals />
				<UploadToasts />
			</DriveProvider>
		</UiStateProvider>
	);
}
