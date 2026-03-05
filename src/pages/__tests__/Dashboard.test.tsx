import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Dashboard from "../Dashboard";

// 子コンポーネントのモック
vi.mock("../../features/dashboard/DashboardFilter", () => ({
	default: () => <div data-testid="dashboard-filter">DashboardFilter</div>,
}));
vi.mock("../../features/dashboard/DashboardLayout", () => ({
	default: () => <div data-testid="dashboard-layout">DashboardLayout</div>,
}));

describe("Dashboard", () => {
	it("見出し・DashboardFilter・DashboardLayout を描画する", () => {
		render(<Dashboard />);
		expect(screen.getByText("Dashboard")).toBeInTheDocument();
		expect(screen.getByTestId("dashboard-filter")).toBeInTheDocument();
		expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
	});
});
