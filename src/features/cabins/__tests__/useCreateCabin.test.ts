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

describe("useCreateCabin", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("作成成功時にトーストを表示しキャッシュを無効化する", async () => {
		const created = { id: 1, name: "Cabin 001" } as any;
		mockCreateEditCabin.mockResolvedValue(created);

		const { useCreateCabin } = await import("../useCreateCabin");
		const queryClient = createTestQueryClient();
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
		const { result } = renderHookWithProviders(() => useCreateCabin(), {
			queryClient,
		});

		result.current.createCabin({
			name: "Cabin 001",
			maxCapacity: 4,
			regularPrice: 250,
			discount: 0,
			description: "Test",
			image: "https://example.com/img.jpg",
		});

		await waitFor(() => {
			expect(mockToast.success).toHaveBeenCalledWith(
				"New cabin successfully created."
			);
		});

		expect(invalidateSpy).toHaveBeenCalledWith(
			expect.objectContaining({ queryKey: ["cabins"] })
		);
	});

	it("作成失敗時にエラートーストを表示する", async () => {
		mockCreateEditCabin.mockRejectedValue(new Error("Create failed"));

		const { useCreateCabin } = await import("../useCreateCabin");
		const { result } = renderHookWithProviders(() => useCreateCabin());

		result.current.createCabin({
			name: "Cabin",
			maxCapacity: 2,
			regularPrice: 100,
			discount: 0,
			description: "Test",
			image: "https://example.com/img.jpg",
		});

		await waitFor(() => {
			expect(mockToast.error).toHaveBeenCalledWith("Create failed");
		});
	});
});
