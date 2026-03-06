import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithProviders } from "../../../test/testUtils";

vi.mock("../../../services/apiBookings");

import { getBookings } from "../../../services/apiBookings";
import type { BookingWithSummary } from "../../../types/domain";
const mockGetBookings = vi.mocked(getBookings);

describe("useBookings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("デフォルトで startDate-desc でソートする", async () => {
		const mockData = { data: [{ id: 1 }] as unknown as BookingWithSummary[], count: 1 };
		mockGetBookings.mockResolvedValue(mockData);

		const { useBookings } = await import("../useBookings");
		const { result } = renderHookWithProviders(() => useBookings());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(mockGetBookings).toHaveBeenCalledWith(
			expect.objectContaining({
				sortBy: { field: "startDate", direction: "desc" },
				page: 1,
			})
		);
	});

	it("status フィルタを URL パラメータから構築する", async () => {
		const mockData = { data: [{ id: 1 }] as unknown as BookingWithSummary[], count: 1 };
		mockGetBookings.mockResolvedValue(mockData);

		const { useBookings } = await import("../useBookings");
		const { result } = renderHookWithProviders(() => useBookings(), {
			routerProps: {
				initialEntries: ["/?status=checked-in"],
			},
		});

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(mockGetBookings).toHaveBeenCalledWith(
			expect.objectContaining({
				filter: { field: "status", value: "checked-in" },
			})
		);
	});

	it("status が 'all' の場合はフィルタが null になる", async () => {
		const mockData = { data: [], count: 0 };
		mockGetBookings.mockResolvedValue(mockData);

		const { useBookings } = await import("../useBookings");
		const { result } = renderHookWithProviders(() => useBookings(), {
			routerProps: {
				initialEntries: ["/?status=all"],
			},
		});

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(mockGetBookings).toHaveBeenCalledWith(
			expect.objectContaining({ filter: null })
		);
	});

	it("不正な sortBy パラメータでデフォルトにフォールバック", async () => {
		const mockData = { data: [], count: 0 };
		mockGetBookings.mockResolvedValue(mockData);

		const { useBookings } = await import("../useBookings");
		const { result } = renderHookWithProviders(() => useBookings(), {
			routerProps: {
				initialEntries: ["/?sortBy=invalidField-up"],
			},
		});

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(mockGetBookings).toHaveBeenCalledWith(
			expect.objectContaining({
				sortBy: { field: "startDate", direction: "desc" },
			})
		);
	});

	it("bookings と count を返す", async () => {
		const mockData = { data: [{ id: 1 }, { id: 2 }] as unknown as BookingWithSummary[], count: 2 };
		mockGetBookings.mockResolvedValue(mockData);

		const { useBookings } = await import("../useBookings");
		const { result } = renderHookWithProviders(() => useBookings());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.bookings).toEqual([{ id: 1 }, { id: 2 }]);
		expect(result.current.count).toBe(2);
	});
});
