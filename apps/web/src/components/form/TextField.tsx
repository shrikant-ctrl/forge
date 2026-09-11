import { useFieldContext } from "../../hooks/form-context";

export function TextField({
	label,
	type = "text",
	placeholder,
}: {
	label: string;
	type?: string;
	placeholder?: string;
}) {
	const field = useFieldContext<string>();

	return (
		<label className="floating-label">
			<span>{label}</span>
			<input
				type={type}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				placeholder={placeholder}
				className="input input-bordered w-full"
			/>
			{field.state.meta.errors.length > 0 && (
				<span className="text-error text-sm">
					{String(field.state.meta.errors[0])}
				</span>
			)}
		</label>
	);
}
