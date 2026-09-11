import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { defineConfig, searchForWorkspaceRoot } from "vite";

const config = defineConfig({
	server: {
		fs: {
			allow: [searchForWorkspaceRoot(process.cwd())],
		},
	},
	resolve: { tsconfigPaths: true },
	// ponytail: @tanstack/react-store's useSelector.js does a named import from
	// the CJS use-sync-external-store shim; without an explicit include here,
	// Vite's dependency scanner doesn't always discover this transitive subpath
	// and reliably convert it to ESM, so it gets served raw and the named
	// import fails in the browser.
	optimizeDeps: {
		include: ["use-sync-external-store/shim/with-selector.js"],
	},
	plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
});

export default config;
