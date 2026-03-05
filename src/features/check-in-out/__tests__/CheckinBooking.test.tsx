import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/testUtils";

const mockCheckin = vi.fn();

// useEffect([booking]) で re-render 毎にリセットされないように安定した参照を使う
const stableBooking = {
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
};

vi.mock("../../bookings/useBooking", () => ({
	useBooking: () => ({
		booking: stableBooking,
		isLoading: false,
	}),
}));

vi.mock("../useCheckin", () => ({
	useCheckin: () => ({ checkin: mockCheckin, isCheckingIn: false }),
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

	it("チェックボックスを有効にしてチェックインボタンをクリックすると checkin が呼ばれる", async () => {
		const user = userEvent.setup();
		renderWithProviders(<CheckinBooking />);

		// 支払い確認チェックボックスをクリック
		const confirmCheckbox = screen.getByRole("checkbox", {
			name: /confirm/i,
		});
		await user.click(confirmCheckbox);

		// Check in ボタンが有効になるのを待つ
		const checkinBtn = screen.getByRole("button", {
			name: /check in booking/i,
		});

		await waitFor(() => {
			expect(checkinBtn).not.toBeDisabled();
		});

		await user.click(checkinBtn);

		expect(mockCheckin).toHaveBeenCalledTimes(1);
	});
});
