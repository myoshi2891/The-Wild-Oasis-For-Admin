import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithProviders } from "../../../test/testUtils";

vi.mock("../../../services/apiBookings");

import { getStaysTodayActivity } from "../../../services/apiBookings";
const mockGetStaysTodayActivity = vi.mocked(getStaysTodayActivity);

describe("useTodayActivity", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("今日のアクティビティデータを返す", async () => {
		const mockActivities = [
			{ id: 1, status: "unconfirmed" },
			{ id: 2, status: "checked-in" },
		];
		mockGetStaysTodayActivity.mockResolvedValue(mockActivities);

		const { useTodayActivity } = await import("../useTodayActivity");
		const { result } = renderHookWithProviders(() => useTodayActivity());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.activities).toEqual(mockActivities);
	});

	it("ローディング状態を返す", async () => {
		mockGetStaysTodayActivity.mockImplementation(() => new Promise(() => {}));

		const { useTodayActivity } = await import("../useTodayActivity");
		const { result } = renderHookWithProviders(() => useTodayActivity());

		expect(result.current.isLoading).toBe(true);
	});
});
