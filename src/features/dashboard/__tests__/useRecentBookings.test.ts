import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithProviders } from "../../../test/testUtils";

vi.mock("../../../services/apiBookings");

import { getBookingsAfterDate } from "../../../services/apiBookings";
const mockGetBookingsAfterDate = vi.mocked(getBookingsAfterDate);

describe("useRecentBookings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("デフォルトで直近7日のデータを取得する", async () => {
		const mockBookings = [{ id: 1, totalPrice: 500 }];
		mockGetBookingsAfterDate.mockResolvedValue(mockBookings);

		const { useRecentBookings } = await import("../useRecentBookings");
		const { result } = renderHookWithProviders(() => useRecentBookings());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.bookings).toEqual(mockBookings);
		expect(mockGetBookingsAfterDate).toHaveBeenCalledTimes(1);
	});

	it("URL パラメータで日数を変更できる", async () => {
		const mockBookings = [{ id: 1 }];
		mockGetBookingsAfterDate.mockResolvedValue(mockBookings);

		const { useRecentBookings } = await import("../useRecentBookings");
		const { result } = renderHookWithProviders(() => useRecentBookings(), {
			routerProps: {
				initialEntries: ["/?last=30"],
			},
		});

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.bookings).toEqual(mockBookings);
	});
});
