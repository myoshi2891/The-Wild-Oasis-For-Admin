import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Outlet } from "react-router-dom";

import App from "../App";

vi.mock("@tanstack/react-query-devtools", () => ({
	ReactQueryDevtools: () => null,
}));

vi.mock("react-hot-toast", () => ({
	Toaster: () => null,
}));

vi.mock("../styles/GlobalStyles", () => ({
	default: () => null,
}));

vi.mock("../ui/ProtectedRoute", () => ({
	default: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("../ui/AppLayout", () => ({
	default: () => (
		<div data-testid="app-layout">
			<Outlet />
		</div>
	),
}));

vi.mock("../pages/Dashboard", () => ({
	default: () => <div>Dashboard page</div>,
}));
vi.mock("../pages/Bookings", () => ({
	default: () => <div>Bookings page</div>,
}));
vi.mock("../pages/Booking", () => ({
	default: () => <div>Booking detail page</div>,
}));
vi.mock("../pages/Checkin", () => ({
	default: () => <div>Check-in page</div>,
}));
vi.mock("../pages/Cabins", () => ({
	default: () => <div>Cabins page</div>,
}));
vi.mock("../pages/Users", () => ({
	default: () => <div>Users page</div>,
}));
vi.mock("../pages/Settings", () => ({
	default: () => <div>Settings page</div>,
}));
vi.mock("../pages/Account", () => ({
	default: () => <div>Account page</div>,
}));
vi.mock("../pages/Login", () => ({
	default: () => <div>Login page</div>,
}));
vi.mock("../pages/PageNotFound", () => ({
	default: () => <div>Page not found</div>,
}));

function renderAt(path: string) {
	window.history.pushState({}, "", path);
	return render(<App />);
}

describe("App routing", () => {
	beforeEach(() => {
		window.history.pushState({}, "", "/");
	});

	it("ルートURLからダッシュボードへリダイレクトする", async () => {
		renderAt("/");

		expect(await screen.findByText("Dashboard page")).toBeInTheDocument();
		expect(screen.getByTestId("app-layout")).toBeInTheDocument();
		expect(window.location.pathname).toBe("/dashboard");
	});

	it("動的な予約詳細ルートを表示する", () => {
		renderAt("/bookings/42");

		expect(screen.getByText("Booking detail page")).toBeInTheDocument();
		expect(screen.getByTestId("app-layout")).toBeInTheDocument();
	});

	it("未知のURLでは404ページを表示する", () => {
		renderAt("/unknown-route");

		expect(screen.getByText("Page not found")).toBeInTheDocument();
		expect(screen.queryByTestId("app-layout")).not.toBeInTheDocument();
	});
});
