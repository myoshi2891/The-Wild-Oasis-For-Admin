import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import {
	mockToast,
	renderHookWithProviders,
	createTestQueryClient,
} from "../../../test/testUtils";

vi.mock("../../../services/apiBookings");

import { deleteBooking as deleteBookingApi } from "../../../services/apiBookings";
const mockDeleteBookingApi = vi.mocked(deleteBookingApi);

describe("useDeleteBooking", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("削除成功時にトーストを表示しキャッシュを無効化する", async () => {
		mockDeleteBookingApi.mockResolvedValue(null);

		const { useDeleteBooking } = await import("../useDeleteBooking");
		const queryClient = createTestQueryClient();
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
		const { result } = renderHookWithProviders(() => useDeleteBooking(), {
			queryClient,
		});

		result.current.deleteBooking(1);

		await waitFor(() => {
			expect(mockToast.success).toHaveBeenCalledWith(
				"Booking was successfully deleted!"
			);
		});

		expect(invalidateSpy).toHaveBeenCalledWith(
			expect.objectContaining({ queryKey: ["bookings"] })
		);
	});

	it("削除失敗時にエラートーストを表示する", async () => {
		mockDeleteBookingApi.mockRejectedValue(new Error("Delete failed"));

		const { useDeleteBooking } = await import("../useDeleteBooking");
		const { result } = renderHookWithProviders(() => useDeleteBooking());

		result.current.deleteBooking(1);

		await waitFor(() => {
			expect(mockToast.error).toHaveBeenCalledWith("Delete failed");
		});
	});
});
