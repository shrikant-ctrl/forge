import createClient from "openapi-fetch";
import { onSessionKilled } from "../auth/session-killed";
import {
	clearTokens,
	getAccessToken,
	getRefreshToken,
	setTokens,
} from "../auth/token-storage";
import { REFRESH_REUSE_MESSAGE_MARKER } from "./errors";
import type { paths } from "./schema.gen";
import type { TokenResponseDto } from "./types";

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const api = createClient<paths>({ baseUrl });

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
	const refreshToken = getRefreshToken();
	if (!refreshToken) return null;

	const res = await fetch(`${baseUrl}/api/auth/refresh`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ refreshToken }),
	});
	if (!res.ok) {
		const body: { message?: string } | null = await res
			.json()
			.catch(() => null);
		clearTokens();
		if (body?.message?.includes(REFRESH_REUSE_MESSAGE_MARKER))
			onSessionKilled();
		return null;
	}

	const tokens: TokenResponseDto = await res.json();
	setTokens(tokens);
	return tokens.accessToken;
}

// ponytail: clone the request in onRequest (pre-send) rather than reusing the
// already-sent Request in onResponse — a sent Request's body stream is
// disturbed and `new Request(sentRequest, ...)` throws once that happens.
const pendingClones = new Map<string, Request>();

api.use({
	onRequest({ request, id }) {
		const token = getAccessToken();
		if (token) request.headers.set("Authorization", `Bearer ${token}`);
		pendingClones.set(id, request.clone());
		return request;
	},
	async onResponse({ request, response, id }) {
		const original = pendingClones.get(id);
		pendingClones.delete(id);

		const isAuthEndpoint =
			request.url.includes("/api/auth/refresh") ||
			request.url.includes("/api/auth/login");
		if (response.status !== 401 || isAuthEndpoint || !original) return response;

		refreshPromise ??= doRefresh().finally(() => {
			refreshPromise = null;
		});
		const newToken = await refreshPromise;
		if (!newToken) return response;

		original.headers.set("Authorization", `Bearer ${newToken}`);
		return fetch(original);
	},
});
