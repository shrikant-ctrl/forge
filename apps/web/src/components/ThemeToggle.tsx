import { useEffect, useState } from "react";
import { ComputerIcon, MoonIcon, SunIcon } from "./icons";

type ThemeMode = "light" | "dark" | "auto";

function getInitialMode(): ThemeMode {
	if (typeof window === "undefined") {
		return "auto";
	}

	const stored = window.localStorage.getItem("theme");
	if (stored === "light" || stored === "dark" || stored === "auto") {
		return stored;
	}

	return "auto";
}

function applyThemeMode(mode: ThemeMode) {
	if (mode === "auto") {
		document.documentElement.removeAttribute("data-theme");
	} else {
		document.documentElement.setAttribute("data-theme", mode);
	}
}

const ICON_BY_MODE: Record<ThemeMode, typeof SunIcon> = {
	light: SunIcon,
	dark: MoonIcon,
	auto: ComputerIcon,
};

export default function ThemeToggle() {
	const [mode, setMode] = useState<ThemeMode>("auto");

	useEffect(() => {
		const initialMode = getInitialMode();
		setMode(initialMode);
		applyThemeMode(initialMode);
	}, []);

	function toggleMode() {
		const nextMode: ThemeMode =
			mode === "light" ? "dark" : mode === "dark" ? "auto" : "light";
		setMode(nextMode);
		applyThemeMode(nextMode);
		window.localStorage.setItem("theme", nextMode);
	}

	const Icon = ICON_BY_MODE[mode];
	const label = mode === "auto" ? "Theme: system default" : `Theme: ${mode}`;

	return (
		<button
			type="button"
			onClick={toggleMode}
			aria-label={label}
			title={label}
			className="btn btn-ghost btn-circle btn-sm"
		>
			<Icon className="size-5" />
		</button>
	);
}
