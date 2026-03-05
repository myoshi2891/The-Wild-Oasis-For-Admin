import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../LoginForm";

// useLogin のモック
const mockLogin = vi.fn();
vi.mock("../useLogin", () => ({
	useLogin: () => ({
		login: mockLogin,
		isLoading: false,
	}),
}));

describe("LoginForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("メール・パスワードフィールドとログインボタンを描画する", () => {
		render(<LoginForm />);
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /login/i })
		).toBeInTheDocument();
	});

	it("フォーム送信で login 関数を呼び出す", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		await user.type(screen.getByLabelText(/email/i), "test@test.com");
		await user.type(screen.getByLabelText(/password/i), "password123");
		await user.click(screen.getByRole("button", { name: /login/i }));

		expect(mockLogin).toHaveBeenCalledWith(
			{ email: "test@test.com", password: "password123" },
			expect.objectContaining({ onSettled: expect.any(Function) })
		);
	});

	it("空のフィールドで送信すると login が呼ばれない", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		await user.click(screen.getByRole("button", { name: /login/i }));
		expect(mockLogin).not.toHaveBeenCalled();
	});
});
