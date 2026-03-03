import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

interface DarkModeContextType {
	isDarkMode: boolean;
	toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(
	undefined
);

interface DarkModeProviderProps {
	children: ReactNode;
}

function DarkModeProvider({ children }: DarkModeProviderProps) {
	const prefersDark =
		typeof window !== "undefined" && typeof window.matchMedia === "function"
			? window.matchMedia("(prefers-color-scheme: dark)").matches
			: false;

	const [isDarkMode, setIsDarkMode] = useLocalStorageState<boolean>(
		prefersDark,
		"isDarkMode"
	);

	useEffect(
		function () {
			if (isDarkMode) {
				document.documentElement.classList.add("dark-mode");
				document.documentElement.classList.remove("light-mode");
			} else {
				document.documentElement.classList.add("light-mode");
				document.documentElement.classList.remove("dark-mode");
			}
		},
		[isDarkMode]
	);

	function toggleDarkMode() {
		setIsDarkMode((isDark) => !isDark);
	}

	return (
		<DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
			{children}
		</DarkModeContext.Provider>
	);
}

function useDarkMode(): DarkModeContextType {
	const context = useContext(DarkModeContext);
	if (context === undefined)
		throw new Error(
			"DarkModeContext was used outside of DarkModeProvider..."
		);
	return context;
}

export { DarkModeProvider, useDarkMode };
export type { DarkModeContextType };
