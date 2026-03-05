
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";

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
