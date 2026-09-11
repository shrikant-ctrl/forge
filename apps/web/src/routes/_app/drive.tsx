import { createFileRoute, Outlet } from "@tanstack/react-router";

// ponytail: this file's naming (`drive.tsx` alongside `drive.$folderId.tsx`)
// makes it the parent layout route for both `/drive` and `/drive/$folderId`
// in TanStack Router's flat-file convention — it must render an Outlet, or
// the `$folderId` child route can never mount. The actual `/drive` root-view
// content lives in the sibling index route, `drive.index.tsx`.
export const Route = createFileRoute("/_app/drive")({
	component: Outlet,
});
