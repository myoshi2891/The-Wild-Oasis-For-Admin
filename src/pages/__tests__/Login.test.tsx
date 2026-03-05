import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Login from "../Login";

// 子コンポーネントのモック（浅いレンダリング）
vi.mock("../../features/authentication/LoginForm", () => ({
	default: () => <div data-testid="login-form">LoginForm</div>,
}));
vi.mock("../../ui/Logo", () => ({
	default: () => <div data-testid="logo">Logo</div>,
}));

describe("Login", () => {
	it("Logo・見出し・LoginForm を含むレイアウトを描画する", () => {
		render(<Login />);
		expect(screen.getByTestId("logo")).toBeInTheDocument();
		expect(screen.getByText("Log in to your account")).toBeInTheDocument();
		expect(screen.getByTestId("login-form")).toBeInTheDocument();
	});
});
