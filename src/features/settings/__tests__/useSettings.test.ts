import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithProviders } from "../../../test/testUtils";

vi.mock("../../../services/apiSettings");

import { getSettings } from "../../../services/apiSettings";
const mockGetSettings = vi.mocked(getSettings);

describe("useSettings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("設定データを返す", async () => {
		const mockSettings = {
			id: 1,
			minBookingLength: 3,
			maxBookingLength: 90,
			maxGuestsPerBooking: 8,
			breakfastPrice: 15,
		};
		mockGetSettings.mockResolvedValue(mockSettings);

		const { useSettings } = await import("../useSettings");
		const { result } = renderHookWithProviders(() => useSettings());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.settings).toEqual(mockSettings);
	});

	it("ローディング状態を返す", async () => {
		mockGetSettings.mockImplementation(() => new Promise(() => {}));

		const { useSettings } = await import("../useSettings");
		const { result } = renderHookWithProviders(() => useSettings());

		expect(result.current.isLoading).toBe(true);
	});

	it("API がエラーを返した場合に error を設定する", async () => {
		mockGetSettings.mockRejectedValue(new Error("API Error"));

		const { useSettings } = await import("../useSettings");
		const { result } = renderHookWithProviders(() => useSettings());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.error).toBeDefined();
		expect((result.current.error as Error).message).toBe("API Error");
	});
});
