import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";
import CabinTableOperations from "../CabinTableOperations";

describe("CabinTableOperations", () => {
	it("Filter と SortBy を描画する", () => {
		renderWithProviders(<CabinTableOperations />);

		// Filter options
		expect(
			screen.getByRole("button", { name: "All" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "No discount" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "With discount" })
		).toBeInTheDocument();

		// SortBy options
		expect(screen.getByRole("combobox")).toBeInTheDocument();
		expect(screen.getAllByRole("option")).toHaveLength(6);
	});
});
