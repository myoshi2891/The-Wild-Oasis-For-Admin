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

		const now = Date.now();
		const { useRecentBookings } = await import("../useRecentBookings");
		const { result } = renderHookWithProviders(() => useRecentBookings());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.bookings).toEqual(mockBookings);
		expect(mockGetBookingsAfterDate).toHaveBeenCalledTimes(1);

		// 引数が7日前の日付であることを検証（1日の許容誤差）
		const calledDate = mockGetBookingsAfterDate.mock.calls[0][0];
		const expectedDate = new Date(now);
		expectedDate.setDate(expectedDate.getDate() - 7);
		const calledTimestamp = new Date(calledDate).getTime();
		const expectedTimestamp = expectedDate.getTime();
		const oneDayMs = 24 * 60 * 60 * 1000;
		expect(Math.abs(calledTimestamp - expectedTimestamp)).toBeLessThan(
			oneDayMs
		);
	});

	it("URL パラメータで日数を変更できる", async () => {
		const mockBookings = [{ id: 1 }];
		mockGetBookingsAfterDate.mockResolvedValue(mockBookings);

		const now = Date.now();
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
		expect(mockGetBookingsAfterDate).toHaveBeenCalledTimes(1);

		// 引数が30日前の日付であることを検証（1日の許容誤差）
		const calledDate = mockGetBookingsAfterDate.mock.calls[0][0];
		const expectedDate = new Date(now);
		expectedDate.setDate(expectedDate.getDate() - 30);
		const calledTimestamp = new Date(calledDate).getTime();
		const expectedTimestamp = expectedDate.getTime();
		const oneDayMs = 24 * 60 * 60 * 1000;
		expect(Math.abs(calledTimestamp - expectedTimestamp)).toBeLessThan(
			oneDayMs
		);
	});
});
