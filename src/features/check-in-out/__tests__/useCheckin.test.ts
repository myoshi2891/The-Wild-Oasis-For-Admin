import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import {
	mockNavigate,
	mockToast,
	renderHookWithProviders,
	createTestQueryClient,
} from "../../../test/testUtils";

vi.mock("../../../services/apiBookings");

import { updateBooking } from "../../../services/apiBookings";
const mockUpdateBooking = vi.mocked(updateBooking);

describe("useCheckin", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("チェックイン成功時にトースト表示・キャッシュ無効化・ルートへ遷移", async () => {
		const updated = { id: 1, status: "checked-in" } as any;
		mockUpdateBooking.mockResolvedValue(updated);

		const { useCheckin } = await import("../useCheckin");
		const queryClient = createTestQueryClient();
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
		const { result } = renderHookWithProviders(() => useCheckin(), {
			queryClient,
		});

		result.current.checkin({ bookingId: 1 });

		await waitFor(() => {
			expect(mockToast.success).toHaveBeenCalledWith(
				"Booking #1 successfully checked in"
			);
		});

		expect(invalidateSpy).toHaveBeenCalledWith(
			expect.objectContaining({ queryKey: ["bookings"] })
		);
		expect(mockNavigate).toHaveBeenCalledWith("/");
	});

	it("朝食オプション付きチェックイン: updateBooking に breakfast データを含める", async () => {
		const updated = { id: 2, status: "checked-in" } as any;
		mockUpdateBooking.mockResolvedValue(updated);

		const { useCheckin } = await import("../useCheckin");
		const { result } = renderHookWithProviders(() => useCheckin());

		result.current.checkin({
			bookingId: 2,
			breakfast: {
				hasBreakfast: true,
				extrasPrice: 30,
				totalPrice: 280,
			},
		});

		await waitFor(() => {
			expect(mockUpdateBooking).toHaveBeenCalledWith(2, {
				hasBreakfast: true,
				extrasPrice: 30,
				totalPrice: 280,
				status: "checked-in",
				isPaid: true,
			});
		});
	});

	it("チェックイン失敗時にエラートーストを表示する", async () => {
		mockUpdateBooking.mockRejectedValue(new Error("Checkin error"));

		const { useCheckin } = await import("../useCheckin");
		const { result } = renderHookWithProviders(() => useCheckin());

		result.current.checkin({ bookingId: 1 });

		await waitFor(() => {
			expect(mockToast.error).toHaveBeenCalledWith(
				"There was an error while checking in"
			);
		});
	});
});
