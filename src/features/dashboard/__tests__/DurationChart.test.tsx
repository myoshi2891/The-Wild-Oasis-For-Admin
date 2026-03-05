import React from "react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";

// Recharts の ResponsiveContainer が ResizeObserver を使うため polyfill
beforeAll(() => {
	global.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
});

vi.mock("../../../context/DarkModeContext", () => ({
	useDarkMode: () => ({ isDarkMode: false }),
}));

import DurationChart from "../DurationChart";

describe("DurationChart", () => {
	it("見出しを表示する", () => {
		renderWithProviders(
			<DurationChart confirmedStays={[]} />
		);
		expect(
			screen.getByText(/stay duration summary/i)
		).toBeInTheDocument();
	});

	it("空の confirmedStays でクラッシュしない", () => {
		expect(() =>
			renderWithProviders(
				<DurationChart confirmedStays={[]} />
			)
		).not.toThrow();
	});
});
