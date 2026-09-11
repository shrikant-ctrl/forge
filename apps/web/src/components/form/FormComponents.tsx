import { useFormContext } from "../../hooks/form-context";

export function SubmitButton({ label }: { label: string }) {
	const form = useFormContext();

	return (
		<form.Subscribe selector={(s) => s.isSubmitting}>
			{(isSubmitting) => (
				<button
					type="submit"
					className="btn btn-primary mt-2"
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<span className="loading loading-spinner loading-sm" />
					) : (
						label
					)}
				</button>
			)}
		</form.Subscribe>
	);
}

export function FormError() {
	const form = useFormContext();

	return (
		<form.Subscribe selector={(s) => s.errorMap.onSubmit}>
			{(onSubmitError) => {
				const message = (onSubmitError as { form?: string } | undefined)?.form;
				return message ? (
					<div className="alert alert-error text-sm">{message}</div>
				) : null;
			}}
		</form.Subscribe>
	);
}
