import { createFileRoute, Outlet } from "@tanstack/react-router";
import DriveModals from "../components/drive/DriveModals";
import Navbar from "../components/drive/Navbar";
import Sidebar from "../components/drive/Sidebar";
import UploadToasts from "../components/drive/UploadToasts";
import { DriveProvider } from "../lib/drive-store";

export const Route = createFileRoute("/_app")({
	component: AppLayout,
});

function AppLayout() {
	return (
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
	);
}
