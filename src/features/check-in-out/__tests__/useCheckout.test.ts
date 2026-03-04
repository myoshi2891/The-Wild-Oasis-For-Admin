import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import {
	mockToast,
	renderHookWithProviders,
	createTestQueryClient,
} from "../../../test/testUtils";

vi.mock("../../../services/apiBookings");

import { updateBooking } from "../../../services/apiBookings";
const mockUpdateBooking = vi.mocked(updateBooking);

describe("useCheckout", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("チェックアウト成功時にトースト・キャッシュ無効化", async () => {
		const updated = { id: 3, status: "checked-out" };
		mockUpdateBooking.mockResolvedValue(updated);

		const { useCheckout } = await import("../useCheckout");
		const queryClient = createTestQueryClient();
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
		const { result } = renderHookWithProviders(() => useCheckout(), {
			queryClient,
		});

		result.current.checkout(3);

		await waitFor(() => {
			expect(mockToast.success).toHaveBeenCalledWith(
				"Booking #3 successfully checked out"
			);
		});

		expect(invalidateSpy).toHaveBeenCalledWith(
			expect.objectContaining({ queryKey: ["bookings"] })
		);
	});

	it("チェックアウト失敗時にエラートーストを表示する", async () => {
		mockUpdateBooking.mockRejectedValue(new Error("Checkout error"));

		const { useCheckout } = await import("../useCheckout");
		const { result } = renderHookWithProviders(() => useCheckout());

		result.current.checkout(1);

		await waitFor(() => {
			expect(mockToast.error).toHaveBeenCalledWith(
				"There was an error while checking out"
			);
		});
	});
});
