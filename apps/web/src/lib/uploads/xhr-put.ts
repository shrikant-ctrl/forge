// fetch has no upload-progress event; XHR is the only stdlib option that
// exposes xhr.upload.onprogress for real byte-level progress.
export function putToPresignedUrl(
	url: string,
	file: File,
	mimeType: string,
	onProgress: (pct: number) => void,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("PUT", url);
		// must byte-for-byte match init-upload's mimeType (S3 SigV4 signature)
		xhr.setRequestHeader("Content-Type", mimeType);
		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable)
				onProgress(Math.round((e.loaded / e.total) * 100));
		};
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) resolve();
			else reject(new Error(`upload failed: ${xhr.status}`));
		};
		xhr.onerror = () => reject(new Error("upload network error"));
		xhr.send(file);
	});
}
