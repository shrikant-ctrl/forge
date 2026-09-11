import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setSessionKilledHandler } from "./lib/auth/session-killed";
import { clearTokens } from "./lib/auth/token-storage";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const queryClient = new QueryClient();

	const router = createTanStackRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: () => <div>404 - Page Not Found</div>,
	});

	setSessionKilledHandler(() => {
		clearTokens();
		queryClient.removeQueries({ queryKey: ["auth", "me"] });
		router.navigate({ to: "/login" });
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
