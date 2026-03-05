import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/testUtils";

const mockUpdateUser = vi.fn();
vi.mock("../useUpdateUser", () => ({
	useUpdateUser: () => ({ updateUser: mockUpdateUser, isUpdating: false }),
}));

import UpdatePasswordForm from "../UpdatePasswordForm";

describe("UpdatePasswordForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("パスワードフォームを描画する", () => {
		renderWithProviders(<UpdatePasswordForm />);

		expect(
			screen.getByLabelText(/new password/i)
		).toBeInTheDocument();
		expect(
			screen.getByLabelText(/confirm password/i)
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /update password/i })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /cancel/i })
		).toBeInTheDocument();
	});

	it("パスワード不一致でバリデーションエラーを表示する", async () => {
		const user = userEvent.setup();
		renderWithProviders(<UpdatePasswordForm />);

		await user.type(
			screen.getByLabelText(/new password/i),
			"password123"
		);
		await user.type(
			screen.getByLabelText(/confirm password/i),
			"different123"
		);

		await user.click(
			screen.getByRole("button", { name: /update password/i })
		);

		await waitFor(() => {
			expect(
				screen.getByText("Passwords need to match")
			).toBeInTheDocument();
		});

		expect(mockUpdateUser).not.toHaveBeenCalled();
	});

	it("正常送信で updateUser を呼び出す", async () => {
		const user = userEvent.setup();
		renderWithProviders(<UpdatePasswordForm />);

		await user.type(
			screen.getByLabelText(/new password/i),
			"validpassword"
		);
		await user.type(
			screen.getByLabelText(/confirm password/i),
			"validpassword"
		);

		await user.click(
			screen.getByRole("button", { name: /update password/i })
		);

		await waitFor(() => {
			expect(mockUpdateUser).toHaveBeenCalledTimes(1);
		});

		expect(mockUpdateUser).toHaveBeenCalledWith(
			{ password: "validpassword" },
			expect.objectContaining({ onSuccess: expect.any(Function) })
		);
	});
});
