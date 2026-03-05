import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";

const mockCheckin = vi.fn();

vi.mock("../../bookings/useBooking", () => ({
	useBooking: () => ({
		booking: {
			id: 10,
			status: "unconfirmed",
			startDate: "2025-02-01",
			endDate: "2025-02-04",
			numNights: 3,
			numGuests: 2,
			totalPrice: 840,
			cabinPrice: 750,
			extrasPrice: 0,
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
		},
		isLoading: false,
	}),
}));

vi.mock("../useCheckin", () => ({
	useCheckin: () => ({ checkin: mockCheckin, isCheckigIn: false }),
}));

vi.mock("../../settings/useSettings", () => ({
	useSettings: () => ({
		settings: { breakfastPrice: 15 },
		isLoading: false,
	}),
}));

import CheckinBooking from "../CheckinBooking";

describe("CheckinBooking", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("予約チェックインの見出しを表示する", () => {
		renderWithProviders(<CheckinBooking />);
		expect(
			screen.getByRole("heading", { name: /check in booking #10/i })
		).toBeInTheDocument();
	});

	it("朝食なし予約で朝食追加チェックボックスを表示する", () => {
		renderWithProviders(<CheckinBooking />);
		expect(
			screen.getByRole("checkbox", { name: /breakfast/i })
		).toBeInTheDocument();
	});

	it("支払い確認チェックボックスを表示する", () => {
		renderWithProviders(<CheckinBooking />);
		expect(
			screen.getByRole("checkbox", { name: /confirm/i })
		).toBeInTheDocument();
	});

	it("Check in ボタンが初期状態で disabled", () => {
		renderWithProviders(<CheckinBooking />);
		const checkinBtn = screen.getByRole("button", {
			name: /check in booking/i,
		});
		expect(checkinBtn).toBeDisabled();
	});
});
