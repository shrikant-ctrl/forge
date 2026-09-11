import { createFormHook } from "@tanstack/react-form";
import { FormError, SubmitButton } from "../components/form/FormComponents";
import { TextField } from "../components/form/TextField";
import { fieldContext, formContext } from "./form-context";

export const { useAppForm } = createFormHook({
	fieldComponents: { TextField },
	formComponents: { SubmitButton, FormError },
	fieldContext,
	formContext,
});
