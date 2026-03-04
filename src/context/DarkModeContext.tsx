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

/**
 * Provides dark mode state and a toggle to descendant components while synchronizing the document root's CSS class.
 *
 * The initial preference is derived from the `prefers-color-scheme: dark` media query (when available) and persisted to local storage under the key `"isDarkMode"`. When `isDarkMode` changes, the provider adds either `dark-mode` or `light-mode` to `document.documentElement` and removes the opposite class.
 *
 * @returns A React context provider that supplies `{ isDarkMode, toggleDarkMode }` to its children and renders the given `children`.
 */
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

/**
 * Access the dark mode context value from the nearest DarkModeProvider.
 *
 * @returns The current dark mode context containing `isDarkMode` and `toggleDarkMode`.
 * @throws Error if called outside of a DarkModeProvider.
 */
function useDarkMode(): DarkModeContextType {
	const context = useContext(DarkModeContext);
	if (context === undefined)
		throw new Error(
			"DarkModeContext was used outside of DarkModeProvider..."
		);
	return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export { DarkModeProvider, useDarkMode };
export type { DarkModeContextType };
