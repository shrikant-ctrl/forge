const ACCESS_KEY = "forge.accessToken";
const REFRESH_KEY = "forge.refreshToken";

// ponytail: this app is SSR'd (TanStack Start) but the backend only accepts a
// Bearer header, never a cookie — the server has no way to see a session, so
// tokens live in browser-only localStorage and every read is a no-op on the
// server. That makes auth an inherently client-side check here; see the
// beforeLoad guards in _app.tsx/login.tsx.
const hasStorage = typeof window !== "undefined";

export function getAccessToken(): string | null {
	return hasStorage ? localStorage.getItem(ACCESS_KEY) : null;
}

export function getRefreshToken(): string | null {
	return hasStorage ? localStorage.getItem(REFRESH_KEY) : null;
}

export function setTokens(tokens: {
	accessToken: string;
	refreshToken: string;
}): void {
	if (!hasStorage) return;
	localStorage.setItem(ACCESS_KEY, tokens.accessToken);
	localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

export function clearTokens(): void {
	if (!hasStorage) return;
	localStorage.removeItem(ACCESS_KEY);
	localStorage.removeItem(REFRESH_KEY);
}

export function isLoggedIn(): boolean {
	return getAccessToken() !== null;
}
