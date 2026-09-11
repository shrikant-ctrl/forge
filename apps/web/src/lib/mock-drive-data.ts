import type { DriveFile, DriveFolder } from "./drive-types";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function ago(ms: number): string {
	return new Date(Date.now() - ms).toISOString();
}

export function createInitialFolders(): DriveFolder[] {
	return [
		{
			id: "f-design",
			name: "Design Assets",
			parentId: null,
			createdAt: ago(60 * DAY),
			updatedAt: ago(2 * HOUR),
		},
		{
			id: "f-proposals",
			name: "Client Proposals",
			parentId: null,
			createdAt: ago(90 * DAY),
			updatedAt: ago(DAY),
		},
		{
			id: "f-2026",
			name: "2026",
			parentId: "f-proposals",
			createdAt: ago(40 * DAY),
			updatedAt: ago(DAY),
		},
		{
			id: "f-engineering",
			name: "Engineering",
			parentId: null,
			createdAt: ago(120 * DAY),
			updatedAt: ago(5 * DAY),
		},
		{
			id: "f-personal",
			name: "Personal",
			parentId: null,
			createdAt: ago(200 * DAY),
			updatedAt: ago(20 * DAY),
		},
	];
}

export function createInitialFiles(): DriveFile[] {
	return [
		{
			id: "file-roadmap",
			name: "Q3 Roadmap.pdf",
			folderId: null,
			sizeBytes: 2_400_000,
			mimeType: "application/pdf",
			createdAt: ago(10 * DAY),
			updatedAt: ago(45 * 60_000),
		},
		{
			id: "file-team-photo",
			name: "Team Photo.png",
			folderId: null,
			sizeBytes: 5_800_000,
			mimeType: "image/png",
			createdAt: ago(3 * DAY),
			updatedAt: ago(3 * HOUR),
		},
		{
			id: "file-budget",
			name: "Budget.xlsx",
			folderId: null,
			sizeBytes: 340_000,
			mimeType: "application/vnd.ms-excel",
			createdAt: ago(15 * DAY),
			updatedAt: ago(2 * DAY),
		},

		{
			id: "file-logo",
			name: "Logo Final.png",
			folderId: "f-design",
			sizeBytes: 1_200_000,
			mimeType: "image/png",
			createdAt: ago(30 * DAY),
			updatedAt: ago(2 * HOUR),
		},
		{
			id: "file-brand-guide",
			name: "Brand Guide.pdf",
			folderId: "f-design",
			sizeBytes: 8_900_000,
			mimeType: "application/pdf",
			createdAt: ago(30 * DAY),
			updatedAt: ago(6 * DAY),
		},
		{
			id: "file-hero-banner",
			name: "Hero Banner.png",
			folderId: "f-design",
			sizeBytes: 3_100_000,
			mimeType: "image/png",
			createdAt: ago(12 * DAY),
			updatedAt: ago(12 * DAY),
		},

		{
			id: "file-proposal-template",
			name: "Proposal Template.docx",
			folderId: "f-proposals",
			sizeBytes: 210_000,
			mimeType: "application/msword",
			createdAt: ago(80 * DAY),
			updatedAt: ago(35 * DAY),
		},
		{
			id: "file-acme-proposal",
			name: "Acme Corp Proposal.pdf",
			folderId: "f-2026",
			sizeBytes: 1_900_000,
			mimeType: "application/pdf",
			createdAt: ago(4 * DAY),
			updatedAt: ago(DAY),
		},
		{
			id: "file-globex-proposal",
			name: "Globex Proposal.pdf",
			folderId: "f-2026",
			sizeBytes: 2_050_000,
			mimeType: "application/pdf",
			createdAt: ago(9 * DAY),
			updatedAt: ago(4 * DAY),
		},

		{
			id: "file-arch-diagram",
			name: "Architecture Diagram.png",
			folderId: "f-engineering",
			sizeBytes: 980_000,
			mimeType: "image/png",
			createdAt: ago(18 * DAY),
			updatedAt: ago(5 * DAY),
		},
		{
			id: "file-sprint-notes",
			name: "sprint-notes.txt",
			folderId: "f-engineering",
			sizeBytes: 4_200,
			mimeType: "text/plain",
			createdAt: ago(2 * DAY),
			updatedAt: ago(6 * HOUR),
		},
		{
			id: "file-demo-reel",
			name: "demo-reel.mp4",
			folderId: "f-engineering",
			sizeBytes: 84_000_000,
			mimeType: "video/mp4",
			createdAt: ago(25 * DAY),
			updatedAt: ago(25 * DAY),
		},
		{
			id: "file-standup-recording",
			name: "standup-recording.mp3",
			folderId: "f-engineering",
			sizeBytes: 6_400_000,
			mimeType: "audio/mpeg",
			createdAt: ago(DAY),
			updatedAt: ago(20 * HOUR),
		},
		{
			id: "file-backend-zip",
			name: "backend-service.zip",
			folderId: "f-engineering",
			sizeBytes: 42_000_000,
			mimeType: "application/zip",
			createdAt: ago(50 * DAY),
			updatedAt: ago(50 * DAY),
		},

		{
			id: "file-resume",
			name: "Resume.pdf",
			folderId: "f-personal",
			sizeBytes: 180_000,
			mimeType: "application/pdf",
			createdAt: ago(100 * DAY),
			updatedAt: ago(20 * DAY),
		},
		{
			id: "file-vacation-zip",
			name: "Vacation Photos.zip",
			folderId: "f-personal",
			sizeBytes: 220_000_000,
			mimeType: "application/zip",
			createdAt: ago(150 * DAY),
			updatedAt: ago(60 * DAY),
		},
	];
}

export const mockUser = {
	name: "Shrikant Jha",
	email: "shrikant@infocusp.com",
	storageQuotaBytes: 10 * 1024 ** 3,
};
