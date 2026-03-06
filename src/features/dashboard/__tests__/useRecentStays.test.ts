import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithProviders } from "../../../test/testUtils";

vi.mock("../../../services/apiBookings");

import { getStaysAfterDate } from "../../../services/apiBookings";
import type { StayAfterDate } from "../../../types/domain";
const mockGetStaysAfterDate = vi.mocked(getStaysAfterDate);

describe("useRecentStays", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("デフォルトで直近7日の滞在データを取得する", async () => {
		const mockStays: Partial<StayAfterDate>[] = [
			{ id: 1, status: "checked-in", numNights: 3 },
			{ id: 2, status: "checked-out", numNights: 2 },
			{ id: 3, status: "unconfirmed", numNights: 1 },
		];
		mockGetStaysAfterDate.mockResolvedValue(mockStays as StayAfterDate[]);

		const { useRecentStays } = await import("../useRecentStays");
		const { result } = renderHookWithProviders(() => useRecentStays());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.stays).toEqual(mockStays);
		expect(result.current.numDays).toBe(7);
	});

	it("confirmedStays が checked-in / checked-out のみをフィルタする", async () => {
		const mockStays: Partial<StayAfterDate>[] = [
			{ id: 1, status: "checked-in", numNights: 3 },
			{ id: 2, status: "checked-out", numNights: 2 },
			{ id: 3, status: "unconfirmed", numNights: 1 },
		];
		mockGetStaysAfterDate.mockResolvedValue(mockStays as StayAfterDate[]);

		const { useRecentStays } = await import("../useRecentStays");
		const { result } = renderHookWithProviders(() => useRecentStays());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.confirmedStays).toHaveLength(2);
		expect(result.current.confirmedStays).toEqual([
			expect.objectContaining({ status: "checked-in" }),
			expect.objectContaining({ status: "checked-out" }),
		]);
	});

	it("URL パラメータで numDays を変更できる", async () => {
		mockGetStaysAfterDate.mockResolvedValue([]);

		const { useRecentStays } = await import("../useRecentStays");
		const { result } = renderHookWithProviders(() => useRecentStays(), {
			routerProps: {
				initialEntries: ["/?last=90"],
			},
		});

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.numDays).toBe(90);
	});
});
