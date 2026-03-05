
import { describe, it, expect, vi, beforeAll } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";

// Recharts の ResponsiveContainer が ResizeObserver を使うため polyfill
beforeAll(() => {
	global.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
});

vi.mock("../useRecentBookings", () => ({
	useRecentBookings: () => ({
		bookings: [
			{
				created_at: "2025-01-15",
				totalPrice: 100,
				extrasPrice: 10,
			},
		],
		isLoading: false,
	}),
}));

vi.mock("../useRecentStays", () => ({
	useRecentStays: () => ({
		confirmedStays: [{ numNights: 3 }],
		isLoading: false,
		numDays: 7,
	}),
}));

vi.mock("../../cabins/useCabins", () => ({
	useCabins: () => ({
		cabins: [{ id: 1 }, { id: 2 }],
		isLoading: false,
	}),
}));

vi.mock("../../check-in-out/useTodayActivity", () => ({
	useTodayActivity: () => ({
		activities: [],
		isLoading: false,
	}),
}));

vi.mock("../../check-in-out/useCheckout", () => ({
	useCheckout: () => ({ checkout: vi.fn(), isCheckingOut: false }),
}));

vi.mock("../../../context/DarkModeContext", () => ({
	useDarkMode: () => ({ isDarkMode: false }),
}));

import DashboardLayout from "../DashboardLayout";

describe("DashboardLayout", () => {
	it("DashboardLayout のコンテンツを描画する", () => {
		renderWithProviders(<DashboardLayout />);

		// Stats の見出しが表示される
		expect(screen.getByText("Booking")).toBeInTheDocument();
		expect(screen.getByText("Sales")).toBeInTheDocument();

		// Today's Activity
		expect(
			screen.getByRole("heading", { name: /today/i })
		).toBeInTheDocument();

		// SalesChart heading
		expect(screen.getByText(/sales from/i)).toBeInTheDocument();

		// DurationChart heading
		expect(
			screen.getByText(/stay duration summary/i)
		).toBeInTheDocument();
	});
});
