import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import {
	mockToast,
	renderHookWithProviders,
	createTestQueryClient,
} from "../../../test/testUtils";

vi.mock("../../../services/apiCabins");

import { deleteCabin as deleteCabinApi } from "../../../services/apiCabins";
const mockDeleteCabinApi = vi.mocked(deleteCabinApi);

describe("useDeleteCabin", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("削除成功時にトーストを表示しキャッシュを無効化する", async () => {
		mockDeleteCabinApi.mockResolvedValue(null);

		const { useDeleteCabin } = await import("../useDeleteCabin");
		const queryClient = createTestQueryClient();
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
		const { result } = renderHookWithProviders(() => useDeleteCabin(), {
			queryClient,
		});

		result.current.deleteCabin(1);

		await waitFor(() => {
			expect(mockToast.success).toHaveBeenCalledWith(
				"Cabin was successfully deleted!"
			);
		});

		expect(invalidateSpy).toHaveBeenCalledWith(
			expect.objectContaining({ queryKey: ["cabins"] })
		);
	});

	it("削除失敗時にエラートーストを表示する", async () => {
		mockDeleteCabinApi.mockRejectedValue(new Error("Delete failed"));

		const { useDeleteCabin } = await import("../useDeleteCabin");
		const { result } = renderHookWithProviders(() => useDeleteCabin());

		result.current.deleteCabin(1);

		await waitFor(() => {
			expect(mockToast.error).toHaveBeenCalledWith("Delete failed");
		});
	});
});
