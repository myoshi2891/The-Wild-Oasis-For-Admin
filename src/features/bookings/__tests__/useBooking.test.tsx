import { type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

// useParams のモック — このファイル専用
let mockBookingId: string | undefined;

vi.mock("react-router-dom", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router-dom")>();
	return {
		...actual,
		useParams: () => ({ bookingId: mockBookingId }),
	};
});

// apiBookings のモック
const mockGetBooking = vi.fn();
vi.mock("../../../services/apiBookings", () => ({
	getBooking: (...args: unknown[]) => mockGetBooking(...args),
}));

import { useBooking } from "../useBooking";

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
		logger: { log: () => {}, warn: () => {}, error: () => {} },
	});
	return function Wrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				<MemoryRouter>{children}</MemoryRouter>
			</QueryClientProvider>
		);
	};
}

describe("useBooking", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockBookingId = undefined;
	});

	it("有効な bookingId でデータを取得する", async () => {
		mockBookingId = "1";
		const mockBooking = { id: 1, status: "unconfirmed" };
		mockGetBooking.mockResolvedValue(mockBooking);

		const { result } = renderHook(() => useBooking(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.booking).toBeDefined();
		});

		expect(result.current.booking).toEqual(mockBooking);
		expect(mockGetBooking).toHaveBeenCalledWith(1);
	});

	it("無効な bookingId では fetch しない", async () => {
		mockBookingId = "abc";

		const { result } = renderHook(() => useBooking(), {
			wrapper: createWrapper(),
		});

		expect(result.current.booking).toBeUndefined();
		expect(mockGetBooking).not.toHaveBeenCalled();
	});

	it("bookingId がない場合は fetch しない", async () => {
		mockBookingId = undefined;

		const { result } = renderHook(() => useBooking(), {
			wrapper: createWrapper(),
		});

		expect(result.current.booking).toBeUndefined();
		expect(mockGetBooking).not.toHaveBeenCalled();
	});
});
