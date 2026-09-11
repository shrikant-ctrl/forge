export type ApiError = {
	message: string;
	statusCode: number;
	fieldErrors: Record<string, string>;
};

type PydanticValidationBody = {
	detail: Array<{ loc: Array<string | number>; msg: string }>;
};
type EnvelopeErrorBody = { statusCode: number; message: string };

export async function normalizeError(response: Response): Promise<ApiError> {
	const body: PydanticValidationBody | EnvelopeErrorBody | null = await response
		.json()
		.catch(() => null);

	if (body && "detail" in body && Array.isArray(body.detail)) {
		const fieldErrors: Record<string, string> = {};
		for (const item of body.detail) {
			const field = item.loc[item.loc.length - 1];
			if (typeof field === "string") fieldErrors[field] = item.msg;
		}
		return {
			message: "Validation failed",
			statusCode: response.status,
			fieldErrors,
		};
	}

	const message = body && "message" in body ? body.message : "Request failed";
	return { message, statusCode: response.status, fieldErrors: {} };
}

export const REFRESH_REUSE_MESSAGE_MARKER = "already been used";
