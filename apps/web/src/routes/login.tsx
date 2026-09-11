import {
	createFileRoute,
	isRedirect,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { useAppForm } from "../hooks/form";
import type { ApiError } from "../lib/api/errors";
import { useLogin, useRegister } from "../lib/auth/mutations";
import { meQueryOptions } from "../lib/auth/queries";
import { loginSchema, registerSchema } from "../lib/auth/schemas";

export const Route = createFileRoute("/login")({
	// ponytail: same reasoning as _app.tsx — the server can't see the
	// localStorage token, so this guard only makes sense client-side.
	ssr: false,
	beforeLoad: async ({ context }) => {
		try {
			await context.queryClient.ensureQueryData(meQueryOptions);
			throw redirect({ to: "/drive" });
		} catch (err) {
			if (isRedirect(err)) throw err;
			// not authenticated — fall through and render the form
		}
	},
	component: LoginPage,
});

type Tab = "login" | "register";

function LoginPage() {
	const [tab, setTab] = useState<Tab>("login");
	const navigate = useNavigate();
	const login = useLogin();
	const register = useRegister();

	const loginForm = useAppForm({
		defaultValues: { email: "", password: "" },
		validators: { onChange: loginSchema },
		onSubmit: async ({ value }) => {
			try {
				await login.mutateAsync(value);
				navigate({ to: "/drive" });
			} catch (err) {
				const apiErr = err as ApiError;
				loginForm.setErrorMap({
					onSubmit: { form: apiErr.message, fields: {} },
				});
			}
		},
	});

	const registerForm = useAppForm({
		defaultValues: { name: "", email: "", password: "" },
		validators: { onChange: registerSchema },
		onSubmit: async ({ value }) => {
			try {
				await register.mutateAsync(value);
				registerForm.reset();
				setTab("login");
			} catch (err) {
				const apiErr = err as ApiError;
				const hasFieldErrors = Object.keys(apiErr.fieldErrors).length > 0;
				registerForm.setErrorMap({
					onSubmit: {
						form: hasFieldErrors ? undefined : apiErr.message,
						fields: apiErr.fieldErrors as Partial<
							Record<"name" | "email" | "password", string>
						>,
					},
				});
			}
		},
	});

	return (
		<div className="flex min-h-screen items-center justify-center bg-base-200 p-4">
			<div className="card w-full max-w-sm bg-base-100 shadow-xl">
				<div className="card-body">
					<div className="mb-2 flex items-center gap-2">
						<span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-content font-bold">
							F
						</span>
						<span className="text-lg font-bold">Forge Drive</span>
					</div>

					<div role="tablist" className="tabs tabs-boxed mb-4">
						<button
							type="button"
							role="tab"
							className={`tab ${tab === "login" ? "tab-active" : ""}`}
							onClick={() => setTab("login")}
						>
							Sign in
						</button>
						<button
							type="button"
							role="tab"
							className={`tab ${tab === "register" ? "tab-active" : ""}`}
							onClick={() => setTab("register")}
						>
							Create account
						</button>
					</div>

					{tab === "login" ? (
						<form
							className="flex flex-col gap-3"
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								loginForm.handleSubmit();
							}}
						>
							<loginForm.AppField name="email">
								{(field) => (
									<field.TextField
										label="Email"
										type="email"
										placeholder="Email"
									/>
								)}
							</loginForm.AppField>

							<loginForm.AppField name="password">
								{(field) => (
									<field.TextField
										label="Password"
										type="password"
										placeholder="Password"
									/>
								)}
							</loginForm.AppField>

							<loginForm.AppForm>
								<loginForm.FormError />
								<loginForm.SubmitButton label="Sign in" />
							</loginForm.AppForm>
						</form>
					) : (
						<form
							className="flex flex-col gap-3"
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								registerForm.handleSubmit();
							}}
						>
							<registerForm.AppField name="name">
								{(field) => (
									<field.TextField
										label="Name"
										type="text"
										placeholder="Name"
									/>
								)}
							</registerForm.AppField>

							<registerForm.AppField name="email">
								{(field) => (
									<field.TextField
										label="Email"
										type="email"
										placeholder="Email"
									/>
								)}
							</registerForm.AppField>

							<registerForm.AppField name="password">
								{(field) => (
									<field.TextField
										label="Password"
										type="password"
										placeholder="Password"
									/>
								)}
							</registerForm.AppField>

							<registerForm.AppForm>
								<registerForm.FormError />
								<registerForm.SubmitButton label="Create account" />
							</registerForm.AppForm>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
