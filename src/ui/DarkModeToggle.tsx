import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";
import ButtonIcon from "./ButtonIcon";
import { useDarkMode } from "../context/DarkModeContext";

/**
 * Renders a toggle button that switches the application's color scheme between dark and light.
 *
 * The button shows a sun icon when the application is currently in dark mode and a moon icon when in light mode.
 *
 * @returns A JSX element for a button that toggles dark/light mode and conveys its purpose with an accessible label.
 */
function DarkModeToggle() {
	const { isDarkMode, toggleDarkMode } = useDarkMode();
	return (
		<ButtonIcon onClick={toggleDarkMode} aria-label="Toggle dark mode">
			{isDarkMode ? <HiOutlineSun /> : <HiOutlineMoon />}
		</ButtonIcon>
	);
}

export default DarkModeToggle;
