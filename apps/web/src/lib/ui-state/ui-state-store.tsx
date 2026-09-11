import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import type { DriveModalState, ViewMode } from "../drive-types";

interface UiStateContextValue {
	viewMode: ViewMode;
	setViewMode: (mode: ViewMode) => void;
	activeModal: DriveModalState;
	openModal: (modal: DriveModalState) => void;
	closeModal: () => void;
}

const UiStateContext = createContext<UiStateContextValue | null>(null);

export function UiStateProvider({ children }: { children: ReactNode }) {
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [activeModal, setActiveModal] = useState<DriveModalState>(null);

	return (
		<UiStateContext.Provider
			value={{
				viewMode,
				setViewMode,
				activeModal,
				openModal: setActiveModal,
				closeModal: () => setActiveModal(null),
			}}
		>
			{children}
		</UiStateContext.Provider>
	);
}

export function useUiState() {
	const ctx = useContext(UiStateContext);
	if (!ctx) throw new Error("useUiState must be used within UiStateProvider");
	return ctx;
}
