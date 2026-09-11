export function formatBytes(bytes: number): string {
	if (bytes <= 0) return "0 B";
	const units = ["B", "KB", "MB", "GB", "TB"];
	const exponent = Math.min(
		Math.floor(Math.log(bytes) / Math.log(1024)),
		units.length - 1,
	);
	const value = bytes / 1024 ** exponent;
	return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

export function formatRelativeDate(iso: string): string {
	const date = new Date(iso);
	const diffMs = Date.now() - date.getTime();
	const diffMinutes = Math.floor(diffMs / 60_000);

	if (diffMinutes < 1) return "Just now";
	if (diffMinutes < 60) return `${diffMinutes}m ago`;
	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24) return `${diffHours}h ago`;
	const diffDays = Math.floor(diffHours / 24);
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return `${diffDays} days ago`;

	return date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function recencyBucket(iso: string): string {
	const date = new Date(iso);
	const now = new Date();
	const startOfToday = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	);
	const diffDays = Math.floor(
		(startOfToday.getTime() - date.getTime()) / 86_400_000,
	);

	if (diffDays <= 0) return "Today";
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return "Earlier this week";
	if (diffDays < 30) return "Earlier this month";
	return "Earlier";
}

export type FileKind =
	| "image"
	| "pdf"
	| "video"
	| "audio"
	| "text"
	| "spreadsheet"
	| "document"
	| "presentation"
	| "archive"
	| "other";

export function fileKind(mimeType: string): FileKind {
	if (mimeType.startsWith("image/")) return "image";
	if (mimeType.startsWith("video/")) return "video";
	if (mimeType.startsWith("audio/")) return "audio";
	if (mimeType === "application/pdf") return "pdf";
	if (mimeType.startsWith("text/")) return "text";
	if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
		return "spreadsheet";
	if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
		return "presentation";
	if (mimeType.includes("word") || mimeType.includes("document"))
		return "document";
	if (mimeType.includes("zip") || mimeType.includes("compressed"))
		return "archive";
	return "other";
}

const EXTENSION_BY_KIND: Record<FileKind, string> = {
	image: "IMG",
	pdf: "PDF",
	video: "VID",
	audio: "AUD",
	text: "TXT",
	spreadsheet: "XLS",
	document: "DOC",
	presentation: "PPT",
	archive: "ZIP",
	other: "FILE",
};

export function fileExtensionLabel(mimeType: string): string {
	return EXTENSION_BY_KIND[fileKind(mimeType)];
}

const BADGE_COLOR_BY_KIND: Record<FileKind, string> = {
	image: "badge-success",
	pdf: "badge-error",
	video: "badge-secondary",
	audio: "badge-accent",
	text: "badge-neutral",
	spreadsheet: "badge-success",
	document: "badge-info",
	presentation: "badge-warning",
	archive: "badge-neutral",
	other: "badge-ghost",
};

export function fileBadgeColor(mimeType: string): string {
	return BADGE_COLOR_BY_KIND[fileKind(mimeType)];
}
