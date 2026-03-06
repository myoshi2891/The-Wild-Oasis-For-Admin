import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DarkModeToggle from "../DarkModeToggle";
import { DarkModeProvider } from "../../context/DarkModeContext";

describe("DarkModeToggle", () => {
	afterEach(() => {
		// グローバル状態のリーク防止
		document.documentElement.classList.remove("dark-mode");
		document.documentElement.classList.remove("light-mode");
		localStorage.removeItem("isDarkMode");
	});

	it("ボタンが描画される", () => {
		render(
			<DarkModeProvider>
				<DarkModeToggle />
			</DarkModeProvider>
		);
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("クリックすると toggleDarkMode が呼び出される（クラスが切り替わる）", async () => {
		const user = userEvent.setup();

		render(
			<DarkModeProvider>
				<DarkModeToggle />
			</DarkModeProvider>
		);

		const initialClass =
			document.documentElement.classList.contains("dark-mode");

		await user.click(screen.getByRole("button"));

		const newClass =
			document.documentElement.classList.contains("dark-mode");

		// The class should have toggled
		expect(newClass).not.toBe(initialClass);
	});
});
