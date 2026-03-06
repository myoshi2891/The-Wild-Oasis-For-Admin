
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";

vi.mock("../../../context/DarkModeContext", () => ({
	useDarkMode: () => ({ isDarkMode: false }),
	DarkModeProvider: ({ children }: any) => <>{children}</>,
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
