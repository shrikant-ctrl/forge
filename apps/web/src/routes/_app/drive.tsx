import { createFileRoute } from "@tanstack/react-router";
import DriveBrowser from "../../components/drive/DriveBrowser";

export const Route = createFileRoute("/_app/drive")({
	component: () => <DriveBrowser folderId={null} />,
});
