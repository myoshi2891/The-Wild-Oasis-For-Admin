import React from "react";
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";

vi.mock("../useTodayActivity", () => ({
	useTodayActivity: () => ({
		activities: [],
		isLoading: false,
	}),
}));

import TodayActivity from "../TodayActivity";

describe("TodayActivity", () => {
	it("見出し 'Today' を表示する", () => {
		renderWithProviders(<TodayActivity />);
		expect(
			screen.getByRole("heading", { name: /today/i })
		).toBeInTheDocument();
	});

	it("アクティビティがない場合に 'No activity today...' を表示する", () => {
		renderWithProviders(<TodayActivity />);
		expect(
			screen.getByText("No activity today...")
		).toBeInTheDocument();
	});
});
