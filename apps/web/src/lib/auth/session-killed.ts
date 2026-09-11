let handler: (() => void) | null = null;

export function setSessionKilledHandler(fn: () => void): void {
	handler = fn;
}

export function onSessionKilled(): void {
	handler?.();
}
