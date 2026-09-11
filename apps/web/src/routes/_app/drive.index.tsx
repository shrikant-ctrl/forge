import { createFileRoute } from "@tanstack/react-router";
import DriveBrowser from "../../components/drive/DriveBrowser";
import { allFilesQueryOptions } from "../../lib/files/queries";
import { foldersQueryOptions } from "../../lib/folders/queries";

export const Route = createFileRoute("/_app/drive/")({
	loader: async ({ context }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(foldersQueryOptions(null)),
			context.queryClient.ensureQueryData(allFilesQueryOptions()),
		]);
	},
	component: () => <DriveBrowser folderId={null} />,
});
