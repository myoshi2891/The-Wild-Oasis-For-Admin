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

import SalesChart from "../SalesChart";

describe("SalesChart", () => {
	it("見出しを表示する", () => {
		renderWithProviders(
			<SalesChart bookings={[]} numDays={7} />
		);
		expect(screen.getByText(/sales from/i)).toBeInTheDocument();
	});

	it("空の bookings でクラッシュしない", () => {
		expect(() =>
			renderWithProviders(
				<SalesChart bookings={[]} numDays={7} />
			)
		).not.toThrow();
	});
});
