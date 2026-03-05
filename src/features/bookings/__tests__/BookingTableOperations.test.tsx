
import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";
import BookingTableOperations from "../BookingTableOperations";

describe("BookingTableOperations", () => {
	it("Filter と SortBy を描画する", () => {
		renderWithProviders(<BookingTableOperations />);

		// Filter options
		expect(
			screen.getByRole("button", { name: "All" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Checked out" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Checked in" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Unconfirmed" })
		).toBeInTheDocument();

		// SortBy options
		const sortSelect = screen.getByRole("combobox");
		expect(sortSelect).toBeInTheDocument();
		expect(within(sortSelect).getAllByRole("option")).toHaveLength(4);
	});
});
