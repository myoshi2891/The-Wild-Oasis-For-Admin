import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";

vi.mock("../useBookings", () => ({
	useBookings: () => ({
		bookings: [
			{
				id: 1,
				startDate: "2025-02-01T00:00:00Z",
				endDate: "2025-02-04T00:00:00Z",
				numNights: 3,
				totalPrice: 840,
				status: "unconfirmed",
				guests: { fullName: "John Doe", email: "john@test.com" },
				cabins: { name: "Cabin 001" },
			},
		],
		isLoading: false,
		count: 1,
	}),
}));

vi.mock("../../check-in-out/useCheckout", () => ({
	useCheckout: () => ({ checkout: vi.fn(), isCheckingOut: false }),
}));

vi.mock("../useDeleteBooking", () => ({
	useDeleteBooking: () => ({
		deleteBooking: vi.fn(),
		isDeleting: false,
	}),
}));

import BookingTable from "../BookingTable";

describe("BookingTable", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("テーブルヘッダーを表示する", () => {
		renderWithProviders(<BookingTable />);

		expect(screen.getByText("Cabin")).toBeInTheDocument();
		expect(screen.getByText("Guest")).toBeInTheDocument();
		expect(screen.getByText("Dates")).toBeInTheDocument();
		expect(screen.getByText("Status")).toBeInTheDocument();
		expect(screen.getByText("Amount")).toBeInTheDocument();
	});

	it("予約データを表示する", () => {
		renderWithProviders(<BookingTable />);

		expect(screen.getByText("Cabin 001")).toBeInTheDocument();
		expect(screen.getByText("John Doe")).toBeInTheDocument();
	});
});
