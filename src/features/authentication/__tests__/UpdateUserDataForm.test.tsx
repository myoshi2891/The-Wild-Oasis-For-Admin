
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/testUtils";

const mockUpdateUser = vi.fn();
vi.mock("../useUpdateUser", () => ({
	useUpdateUser: () => ({ updateUser: mockUpdateUser, isUpdating: false }),
}));

vi.mock("../useUser", () => ({
	useUser: () => ({
		user: {
			email: "test@example.com",
			user_metadata: { fullName: "John Doe" },
		},
	}),
}));

import UpdateUserDataForm from "../UpdateUserDataForm";

describe("UpdateUserDataForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("ユーザー情報フォームを描画する", () => {
		renderWithProviders(<UpdateUserDataForm />);

		// email input は id がないため getByDisplayValue で取得
		const emailInput = screen.getByDisplayValue("test@example.com");
		expect(emailInput).toBeInTheDocument();
		expect(emailInput).toBeDisabled();

		const nameInput = screen.getByLabelText(/full name/i);
		expect(nameInput).toHaveValue("John Doe");

		expect(screen.getByLabelText(/avatar image/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /update account/i })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /cancel/i })
		).toBeInTheDocument();
	});

	it("フルネーム変更後に送信すると updateUser を呼び出す", async () => {
		const user = userEvent.setup();
		renderWithProviders(<UpdateUserDataForm />);

		const nameInput = screen.getByLabelText(/full name/i);
		await user.clear(nameInput);
		await user.type(nameInput, "Jane Smith");

		await user.click(
			screen.getByRole("button", { name: /update account/i })
		);

		expect(mockUpdateUser).toHaveBeenCalledTimes(1);
		expect(mockUpdateUser).toHaveBeenCalledWith(
			{ fullName: "Jane Smith", avatar: null },
			expect.objectContaining({ onSuccess: expect.any(Function) })
		);
	});

	it("Cancel クリックでフルネームが元の値にリセットされる", async () => {
		const user = userEvent.setup();
		renderWithProviders(<UpdateUserDataForm />);

		const nameInput = screen.getByLabelText(/full name/i);
		await user.clear(nameInput);
		await user.type(nameInput, "Changed Name");
		expect(nameInput).toHaveValue("Changed Name");

		await user.click(
			screen.getByRole("button", { name: /cancel/i })
		);

		expect(nameInput).toHaveValue("John Doe");
	});
});
