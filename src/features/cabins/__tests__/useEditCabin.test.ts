import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import {
	mockToast,
	renderHookWithProviders,
	createTestQueryClient,
} from "../../../test/testUtils";

vi.mock("../../../services/apiCabins");

import { createEditCabin } from "../../../services/apiCabins";
const mockCreateEditCabin = vi.mocked(createEditCabin);

describe("useEditCabin", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("編集成功時にトーストを表示しキャッシュを無効化する", async () => {
		const edited = { id: 5, name: "Cabin 005 Updated" } as any;
		mockCreateEditCabin.mockResolvedValue(edited);

		const { useEditCabin } = await import("../useEditCabin");
		const queryClient = createTestQueryClient();
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
		const { result } = renderHookWithProviders(() => useEditCabin(), {
			queryClient,
		});

		result.current.editCabin({
			newCabinData: {
				name: "Cabin 005 Updated",
				maxCapacity: 6,
				regularPrice: 300,
				discount: 50,
				description: "Updated",
				image: "https://example.com/img.jpg",
			},
			id: 5,
		});

		await waitFor(() => {
			expect(mockToast.success).toHaveBeenCalledWith(
				"Cabin successfully edited."
			);
		});

		expect(invalidateSpy).toHaveBeenCalledWith(
			expect.objectContaining({ queryKey: ["cabins"] })
		);
	});

	it("編集失敗時にエラートーストを表示する", async () => {
		mockCreateEditCabin.mockRejectedValue(new Error("Edit failed"));

		const { useEditCabin } = await import("../useEditCabin");
		const { result } = renderHookWithProviders(() => useEditCabin());

		result.current.editCabin({
			newCabinData: {
				name: "Cabin",
				maxCapacity: 2,
				regularPrice: 100,
				discount: 0,
				description: "Test",
				image: "https://example.com/img.jpg",
			},
			id: 1,
		});

		await waitFor(() => {
			expect(mockToast.error).toHaveBeenCalledWith("Edit failed");
		});
	});
});
