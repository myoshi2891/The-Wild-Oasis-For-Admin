import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import {
	mockToast,
	renderHookWithProviders,
	createTestQueryClient,
} from "../../../test/testUtils";

vi.mock("../../../services/apiSettings");

import { updateSetting as updateSettingApi } from "../../../services/apiSettings";
import type { Settings } from "../../../types/domain";
const mockUpdateSettingApi = vi.mocked(updateSettingApi);

describe("useUpdateSetting", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("更新成功時にトーストを表示しキャッシュを無効化する", async () => {
		mockUpdateSettingApi.mockResolvedValue({
			id: 1,
			breakfastPrice: 20,
		} as Settings);

		const { useUpdateSetting } = await import("../useUpdateSetting");
		const queryClient = createTestQueryClient();
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
		const { result } = renderHookWithProviders(() => useUpdateSetting(), {
			queryClient,
		});

		result.current.updateSetting({ breakfastPrice: 20 });

		await waitFor(() => {
			expect(mockToast.success).toHaveBeenCalledWith(
				"Setting successfully edited."
			);
		});

		await waitFor(() => {
			expect(invalidateSpy).toHaveBeenCalledWith(
				expect.objectContaining({ queryKey: ["settings"] })
			);
		});
	});

	it("更新失敗時にエラートーストを表示する", async () => {
		mockUpdateSettingApi.mockRejectedValue(new Error("Update failed"));

		const { useUpdateSetting } = await import("../useUpdateSetting");
		const { result } = renderHookWithProviders(() => useUpdateSetting());

		result.current.updateSetting({ breakfastPrice: 20 });

		await waitFor(() => {
			expect(mockToast.error).toHaveBeenCalledWith("Update failed");
		});
	});
});
