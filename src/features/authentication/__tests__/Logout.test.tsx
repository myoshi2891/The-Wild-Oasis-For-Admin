import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Logout from "../Logout";

// useLogout のモック
const mockLogout = vi.fn();

vi.mock("../useLogout", () => ({
	useLogout: () => ({
		logout: mockLogout,
		isLoading: false,
	}),
}));

describe("Logout", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("ボタンを描画する", () => {
		render(<Logout />);
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("クリックで logout を呼び出す", async () => {
		const user = userEvent.setup();
		render(<Logout />);

		await user.click(screen.getByRole("button"));
		expect(mockLogout).toHaveBeenCalledTimes(1);
	});
});
