import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Bookings from "../Bookings";

// 子コンポーネントのモック
vi.mock("../../features/bookings/BookingTable", () => ({
	default: () => <div data-testid="booking-table">BookingTable</div>,
}));
vi.mock("../../features/bookings/BookingTableOperations", () => ({
	default: () => (
		<div data-testid="booking-table-operations">BookingTableOperations</div>
	),
}));

describe("Bookings", () => {
	it("見出し・BookingTableOperations・BookingTable を描画する", () => {
		render(<Bookings />);
		expect(screen.getByText("All bookings")).toBeInTheDocument();
		expect(
			screen.getByTestId("booking-table-operations")
		).toBeInTheDocument();
		expect(screen.getByTestId("booking-table")).toBeInTheDocument();
	});
});
