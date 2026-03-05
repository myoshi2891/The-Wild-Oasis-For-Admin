import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Settings from "../Settings";

// 子コンポーネントのモック
vi.mock("../../features/settings/UpdateSettingsForm", () => ({
	default: () => (
		<div data-testid="update-settings-form">UpdateSettingsForm</div>
	),
}));

describe("Settings", () => {
	it("見出し・UpdateSettingsForm を描画する", () => {
		render(<Settings />);
		expect(screen.getByText("Update hotel settings")).toBeInTheDocument();
		expect(
			screen.getByTestId("update-settings-form")
		).toBeInTheDocument();
	});
});
