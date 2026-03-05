import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";

const mockBookingData = {
	id: 42,
	status: "unconfirmed",
	startDate: "2025-02-01",
	endDate: "2025-02-04",
	numNights: 3,
	numGuests: 2,
	totalPrice: 840,
	cabinPrice: 750,
	extrasPrice: 90,
	hasBreakfast: false,
	isPaid: false,
	observations: "",
	created_at: "2025-01-10",
	guests: {
		fullName: "John Doe",
		email: "john@test.com",
		country: "US",
		countryFlag: "",
		nationalID: "123",
	},
	cabins: { name: "Cabin 001" },
};

vi.mock("../useBooking", () => ({
	useBooking: () => ({
		booking: mockBookingData,
		isLoading: false,
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

import BookingDetail from "../BookingDetail";

describe("BookingDetail", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("予約詳細の見出しを表示する", () => {
		renderWithProviders(<BookingDetail />);
		expect(screen.getByText(/booking #42/i)).toBeInTheDocument();
	});

	it("ステータスタグを表示する", () => {
		renderWithProviders(<BookingDetail />);
		expect(screen.getByText("unconfirmed")).toBeInTheDocument();
	});

	it("unconfirmed の場合 Check in ボタンを表示する", () => {
		renderWithProviders(<BookingDetail />);
		expect(
			screen.getByRole("button", { name: /check in/i })
		).toBeInTheDocument();
	});

	it("Back リンクと Back ボタンを表示する", () => {
		renderWithProviders(<BookingDetail />);
		// ButtonText "← Back" + Button "Back" の2個
		const backElements = screen.getAllByText(/back/i);
		expect(backElements.length).toBeGreaterThanOrEqual(2);
	});

	it("Delete booking ボタンを表示する", () => {
		renderWithProviders(<BookingDetail />);
		expect(
			screen.getByRole("button", { name: /delete booking/i })
		).toBeInTheDocument();
	});
});
