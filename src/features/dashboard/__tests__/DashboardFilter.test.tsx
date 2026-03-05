import React from "react";
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";
import DashboardFilter from "../DashboardFilter";

describe("DashboardFilter", () => {
	it("3つの Filter オプションを描画する", () => {
		renderWithProviders(<DashboardFilter />);

		expect(
			screen.getByRole("button", { name: "Last 7 days" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Last 30 days" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Last 90 days" })
		).toBeInTheDocument();
	});
});
