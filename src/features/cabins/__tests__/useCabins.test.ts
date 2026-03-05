import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithProviders } from "../../../test/testUtils";

vi.mock("../../../services/apiCabins");

import { getCabins } from "../../../services/apiCabins";
const mockGetCabins = vi.mocked(getCabins);

describe("useCabins", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("客室一覧データを返す", async () => {
		const mockCabins = [
			{ id: 1, name: "Cabin 001" },
			{ id: 2, name: "Cabin 002" },
		] as any;
		mockGetCabins.mockResolvedValue(mockCabins);

		const { useCabins } = await import("../useCabins");
		const { result } = renderHookWithProviders(() => useCabins());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.cabins).toEqual(mockCabins);
	});

	it("ローディング状態を返す", async () => {
		mockGetCabins.mockImplementation(() => new Promise(() => {}));

		const { useCabins } = await import("../useCabins");
		const { result } = renderHookWithProviders(() => useCabins());

		expect(result.current.isLoading).toBe(true);
	});
});
