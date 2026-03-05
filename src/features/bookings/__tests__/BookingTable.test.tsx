
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";

const MOCK_BOOKINGS_RESPONSE = {
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
};

// vi.fn() でラップして per-test でデータを上書き可能にする
const mockUseBookings = vi.fn(() => ({ ...MOCK_BOOKINGS_RESPONSE }));

vi.mock("../useBookings", () => ({
	useBookings: () => mockUseBookings(),
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
		mockUseBookings.mockReturnValue({ ...MOCK_BOOKINGS_RESPONSE });
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

	it("isLoading が true の場合スピナーを表示しテーブルを表示しない", () => {
		mockUseBookings.mockReturnValue({
			bookings: [],
			isLoading: true,
			count: 0,
		});
		const { container } = renderWithProviders(<BookingTable />);

		// Spinner（styled div）が描画されている
		expect(container.firstChild).toBeInTheDocument();
		// テーブルヘッダーが表示されない
		expect(screen.queryByText("Cabin")).not.toBeInTheDocument();
		expect(screen.queryByText("Guest")).not.toBeInTheDocument();
	});

	it("bookings が空の場合 'No bookings could be found.' を表示する", () => {
		mockUseBookings.mockReturnValue({
			bookings: [],
			isLoading: false,
			count: 0,
		});
		renderWithProviders(<BookingTable />);

		expect(
			screen.getByText("No bookings could be found.")
		).toBeInTheDocument();
		// 予約データは表示されない
		expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
	});
});
