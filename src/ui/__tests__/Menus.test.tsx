import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Menus from "../Menus";

describe("Menus", () => {
	it("Toggle クリックで List が表示される", async () => {
		const user = userEvent.setup();

		render(
			<Menus>
				<Menus.Menu>
					<Menus.Toggle id="test-menu" />
					<Menus.List id="test-menu">
						<Menus.Button icon={<span>🗑</span>}>Delete</Menus.Button>
					</Menus.List>
				</Menus.Menu>
			</Menus>
		);

		// Initially, menu item should not be visible
		expect(screen.queryByText("Delete")).not.toBeInTheDocument();

		// Click toggle
		await user.click(screen.getByRole("button", { name: /open menu/i }));

		// Menu item should be visible
		expect(screen.getByText("Delete")).toBeInTheDocument();
	});

	it("Button クリックで onClick が呼ばれメニューが閉じる", async () => {
		const onClick = vi.fn();
		const user = userEvent.setup();

		render(
			<Menus>
				<Menus.Menu>
					<Menus.Toggle id="test-menu" />
					<Menus.List id="test-menu">
						<Menus.Button icon={<span>📝</span>} onClick={onClick}>
							Edit
						</Menus.Button>
					</Menus.List>
				</Menus.Menu>
			</Menus>
		);

		// Open menu
		await user.click(screen.getByRole("button", { name: /open menu/i }));
		// Click the menu button
		await user.click(screen.getByText("Edit"));

		expect(onClick).toHaveBeenCalledTimes(1);
		// Menu should be closed after click
		expect(screen.queryByText("Edit")).not.toBeInTheDocument();
	});

	it("コンテキスト外で使用するとエラーを投げる", () => {
		const consoleSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		expect(() => {
			render(<Menus.Toggle id="no-context" />);
		}).toThrow("Menus compound components must be used within a <Menus>");

		consoleSpy.mockRestore();
	});
});
