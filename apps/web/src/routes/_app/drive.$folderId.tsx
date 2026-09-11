import { createFileRoute } from "@tanstack/react-router";
import DriveBrowser from "../../components/drive/DriveBrowser";

export const Route = createFileRoute("/_app/drive/$folderId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { folderId } = Route.useParams();
	return <DriveBrowser folderId={folderId} />;
}
