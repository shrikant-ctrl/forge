import { createFileRoute } from "@tanstack/react-router";
import DriveBrowser from "../../components/drive/DriveBrowser";
import { folderFilesQueryOptions } from "../../lib/files/queries";
import {
	folderDetailQueryOptions,
	foldersQueryOptions,
} from "../../lib/folders/queries";

export const Route = createFileRoute("/_app/drive/$folderId")({
	loader: async ({ context, params }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(
				folderDetailQueryOptions(params.folderId),
			),
			context.queryClient.ensureQueryData(foldersQueryOptions(params.folderId)),
			context.queryClient.ensureQueryData(
				folderFilesQueryOptions(params.folderId),
			),
		]);
	},
	errorComponent: () => (
		<div className="p-8 text-center text-base-content/60">
			<p>This folder doesn't exist.</p>
		</div>
	),
	component: RouteComponent,
});

function RouteComponent() {
	const { folderId } = Route.useParams();
	return <DriveBrowser folderId={folderId} />;
}
