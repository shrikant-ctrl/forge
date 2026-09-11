import { useEffect, useState } from "react";
import { ComputerIcon } from "./icons";

// Every theme daisyui ships (matches `themes: all` in src/styles.css).
const THEMES = [
	"light",
	"dark",
	"cupcake",
	"bumblebee",
	"emerald",
	"corporate",
	"synthwave",
	"retro",
	"cyberpunk",
	"valentine",
	"halloween",
	"garden",
	"forest",
	"aqua",
	"lofi",
	"pastel",
	"fantasy",
	"wireframe",
	"black",
	"luxury",
	"dracula",
	"cmyk",
	"autumn",
	"business",
	"acid",
	"lemonade",
	"night",
	"coffee",
	"winter",
	"dim",
	"nord",
	"sunset",
	"caramellatte",
	"abyss",
	"silk",
] as const;

type Theme = (typeof THEMES)[number];
type ThemeMode = "auto" | Theme;

function systemTheme(): Theme {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function getInitialMode(): ThemeMode {
	if (typeof window === "undefined") {
		return "auto";
	}

	const stored = window.localStorage.getItem("theme");
	if (
		stored === "auto" ||
		(THEMES as readonly string[]).includes(stored ?? "")
	) {
		return stored as ThemeMode;
	}

	return "auto";
}

function applyThemeMode(mode: ThemeMode) {
	document.documentElement.setAttribute(
		"data-theme",
		mode === "auto" ? systemTheme() : mode,
	);
}

export default function ThemeToggle() {
	const [mode, setMode] = useState<ThemeMode>("auto");

	useEffect(() => {
		const initialMode = getInitialMode();
		setMode(initialMode);
		applyThemeMode(initialMode);
	}, []);

	function selectMode(next: ThemeMode) {
		setMode(next);
		applyThemeMode(next);
		window.localStorage.setItem("theme", next);
	}

	const label = mode === "auto" ? "Theme: system default" : `Theme: ${mode}`;

	return (
		<div className="dropdown dropdown-end">
			<button
				type="button"
				tabIndex={0}
				aria-label={label}
				title={label}
				className="btn btn-ghost btn-circle btn-sm"
			>
				{mode === "auto" ? (
					<ComputerIcon className="size-5" />
				) : (
					<span className="size-4 rounded-full bg-primary ring-1 ring-base-content/20" />
				)}
			</button>
			<ul className="menu dropdown-content z-10 mt-3 max-h-80 w-48 flex-nowrap overflow-y-auto rounded-box bg-base-100 p-2 shadow-lg">
				<li>
					<button
						type="button"
						className={mode === "auto" ? "active" : ""}
						onClick={() => selectMode("auto")}
					>
						<ComputerIcon className="size-4" /> System
					</button>
				</li>
				<li className="menu-title mt-1">
					<span>Themes</span>
				</li>
				{THEMES.map((theme) => (
					<li key={theme}>
						<button
							type="button"
							className={mode === theme ? "active" : ""}
							onClick={() => selectMode(theme)}
						>
							<span
								className="size-3 rounded-full bg-primary"
								data-theme={theme}
							/>
							{theme}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
