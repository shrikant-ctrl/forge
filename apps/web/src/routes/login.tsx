import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

type Tab = "login" | "register";

function LoginPage() {
	const [tab, setTab] = useState<Tab>("login");
	const navigate = useNavigate();

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

					<form
						className="flex flex-col gap-3"
						onSubmit={(e) => {
							e.preventDefault();
							navigate({ to: "/drive" });
						}}
					>
						{tab === "register" && (
							<label className="floating-label">
								<span>Name</span>
								<input
									type="text"
									placeholder="Name"
									required
									className="input input-bordered w-full"
								/>
							</label>
						)}
						<label className="floating-label">
							<span>Email</span>
							<input
								type="email"
								placeholder="Email"
								required
								className="input input-bordered w-full"
							/>
						</label>
						<label className="floating-label">
							<span>Password</span>
							<input
								type="password"
								placeholder="Password"
								required
								className="input input-bordered w-full"
							/>
						</label>

						<button type="submit" className="btn btn-primary mt-2">
							{tab === "login" ? "Sign in" : "Create account"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
