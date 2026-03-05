
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";

vi.mock("../useCheckout", () => ({
	useCheckout: () => ({ checkout: vi.fn(), isCheckingOut: false }),
}));

import TodayItem from "../TodayItem";

const baseActivity = {
	id: 1,
	numNights: 3,
	guests: {
		fullName: "John Doe",
		nationality: "United States",
		countryFlag: "https://flagcdn.com/us.svg",
	},
};

describe("TodayItem", () => {
	it("unconfirmed で 'Arriving' タグと 'Check in' リンクを表示する", () => {
		const activity = { ...baseActivity, status: "unconfirmed" };
		renderWithProviders(<TodayItem activity={activity} />);

		expect(screen.getByText("Arriving")).toBeInTheDocument();
		const checkinLink = screen.getByRole("link", { name: /check in/i });
		expect(checkinLink).toHaveAttribute("href", "/checkin/1");
		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("3 nights")).toBeInTheDocument();
	});

	it("checked-in で 'Departing' タグと 'Check out' ボタンを表示する", () => {
		const activity = { ...baseActivity, status: "checked-in" };
		renderWithProviders(<TodayItem activity={activity} />);

		expect(screen.getByText("Departing")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /check out/i })
		).toBeInTheDocument();
	});
});
