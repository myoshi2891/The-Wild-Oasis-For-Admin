import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/testUtils";

const mockSignup = vi.fn();
vi.mock("../useSignup", () => ({
	useSignup: () => ({ signup: mockSignup, isLoading: false }),
}));

import SignupForm from "../SignupForm";

describe("SignupForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("すべてのフォーム項目とボタンを描画する", () => {
		renderWithProviders(<SignupForm />);

		expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
		expect(
			screen.getByLabelText(/^password \(min 8/i)
		).toBeInTheDocument();
		expect(screen.getByLabelText(/repeat password/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /create new user/i })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /cancel/i })
		).toBeInTheDocument();
	});

	it("空欄送信で必須エラーを表示する", async () => {
		const user = userEvent.setup();
		renderWithProviders(<SignupForm />);

		await user.click(
			screen.getByRole("button", { name: /create new user/i })
		);

		await waitFor(() => {
			expect(
				screen.getAllByText("This field is required").length
			).toBeGreaterThanOrEqual(1);
		});

		expect(mockSignup).not.toHaveBeenCalled();
	});

	it("パスワードが8文字未満でバリデーションエラーを表示する", async () => {
		const user = userEvent.setup();
		renderWithProviders(<SignupForm />);

		await user.type(screen.getByLabelText(/full name/i), "Test User");
		await user.type(
			screen.getByLabelText(/email address/i),
			"test@example.com"
		);
		await user.type(screen.getByLabelText(/^password \(min 8/i), "short");
		await user.type(screen.getByLabelText(/repeat password/i), "short");

		await user.click(
			screen.getByRole("button", { name: /create new user/i })
		);

		await waitFor(() => {
			expect(
				screen.getByText("Password needs at least 8 characters")
			).toBeInTheDocument();
		});
	});

	it("パスワード不一致でバリデーションエラーを表示する", async () => {
		const user = userEvent.setup();
		renderWithProviders(<SignupForm />);

		await user.type(screen.getByLabelText(/full name/i), "Test User");
		await user.type(
			screen.getByLabelText(/email address/i),
			"test@example.com"
		);
		await user.type(
			screen.getByLabelText(/^password \(min 8/i),
			"password123"
		);
		await user.type(
			screen.getByLabelText(/repeat password/i),
			"different123"
		);

		await user.click(
			screen.getByRole("button", { name: /create new user/i })
		);

		await waitFor(() => {
			expect(
				screen.getByText("Passwords need to be matched")
			).toBeInTheDocument();
		});
	});
});
