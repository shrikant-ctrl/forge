import { createFileRoute } from "@tanstack/react-router";
import DriveBrowser from "../../components/drive/DriveBrowser";
import { foldersQueryOptions } from "../../lib/folders/queries";

export const Route = createFileRoute("/_app/drive")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(foldersQueryOptions(null));
	},
	component: () => <DriveBrowser folderId={null} />,
});
