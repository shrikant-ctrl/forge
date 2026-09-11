import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useLogout } from "../../lib/auth/mutations";
import { useDrive } from "../../lib/drive-store";
import { LogoutIcon, SearchIcon, UserIcon } from "../icons";
import ThemeToggle from "../ThemeToggle";

export default function Navbar() {
	const { user } = useDrive();
	const navigate = useNavigate();
	const logout = useLogout();
	const [query, setQuery] = useState("");

	return (
		<div className="navbar border-b border-base-200 bg-base-100 px-4">
			<div className="navbar-start">
				<Link
					to="/drive"
					className="btn btn-ghost gap-2 px-2 text-lg font-bold"
				>
					<span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-content">
						F
					</span>
					Forge Drive
				</Link>
			</div>

			<div className="navbar-center hidden flex-1 justify-center md:flex">
				<form
					className="w-full max-w-xl"
					onSubmit={(e) => {
						e.preventDefault();
						navigate({ to: "/search", search: { q: query } });
					}}
				>
					<label className="input input-bordered flex w-full items-center gap-2 rounded-full">
						<SearchIcon className="size-4 text-base-content/50" />
						<input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search in Drive"
							className="grow"
						/>
					</label>
				</form>
			</div>

			<div className="navbar-end gap-1">
				<ThemeToggle />
				<div className="dropdown dropdown-end">
					<button
						type="button"
						className="btn btn-ghost btn-circle avatar avatar-placeholder"
					>
						<div className="w-9 rounded-full bg-neutral text-neutral-content">
							<span className="text-sm">{user.name.charAt(0)}</span>
						</div>
					</button>
					<ul className="menu dropdown-content menu-sm z-10 mt-3 w-56 rounded-box bg-base-100 p-2 shadow-lg">
						<li className="menu-title">
							<span className="truncate">{user.email}</span>
						</li>
						<li>
							<Link to="/settings">
								<UserIcon className="size-4" /> Settings
							</Link>
						</li>
						<li>
							<button
								type="button"
								onClick={() =>
									logout.mutate(undefined, {
										onSuccess: () => navigate({ to: "/login" }),
									})
								}
							>
								<LogoutIcon className="size-4" /> Sign out
							</button>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
