/**
 * Services 層のテスト
 * Supabase クライアントをモックして API 関数の振る舞いを検証
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Supabase クライアントのモック
const mockFrom = vi.fn();
const mockAuth = {
	signUp: vi.fn(),
	signInWithPassword: vi.fn(),
	getSession: vi.fn(),
	getUser: vi.fn(),
	signOut: vi.fn(),
	updateUser: vi.fn(),
};
const mockStorage = {
	from: vi.fn(() => ({
		upload: vi.fn().mockResolvedValue({ error: null }),
	})),
};

vi.mock("../supabase", () => ({
	default: {
		from: (...args: unknown[]) => mockFrom(...args),
		auth: mockAuth,
		storage: mockStorage,
	},
	supabaseUrl: "https://test.supabase.co",
}));

// ────────────────────────────────────────────
// apiSettings
// ────────────────────────────────────────────
describe("apiSettings", () => {
	beforeEach(() => vi.clearAllMocks());

	it("getSettings が Settings データを返す", async () => {
		const mockSettings = {
			id: 1,
			minBookingLength: 3,
			maxBookingLength: 90,
			maxGuestsPerBooking: 8,
			breakfastPrice: 15,
		};
		mockFrom.mockReturnValue({
			select: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({ data: mockSettings, error: null }),
			}),
		});

		const { getSettings } = await import("../apiSettings");
		const result = await getSettings();
		expect(result).toEqual(mockSettings);
		expect(mockFrom).toHaveBeenCalledWith("settings");
	});

	it("getSettings がエラー時に例外を投げる", async () => {
		mockFrom.mockReturnValue({
			select: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: null,
					error: { message: "DB error" },
				}),
			}),
		});

		const { getSettings } = await import("../apiSettings");
		await expect(getSettings()).rejects.toThrow("Settings could not be loaded");
	});
});

// ────────────────────────────────────────────
// apiCabins
// ────────────────────────────────────────────
describe("apiCabins", () => {
	beforeEach(() => vi.clearAllMocks());

	it("getCabins が Cabin 配列を返す", async () => {
		const mockCabins = [
			{ id: 1, name: "Cabin 001", maxCapacity: 4 },
			{ id: 2, name: "Cabin 002", maxCapacity: 6 },
		];
		mockFrom.mockReturnValue({
			select: vi.fn().mockResolvedValue({ data: mockCabins, error: null }),
		});

		const { getCabins } = await import("../apiCabins");
		const result = await getCabins();
		expect(result).toEqual(mockCabins);
		expect(result).toHaveLength(2);
	});

	it("deleteCabin がエラー時に例外を投げる", async () => {
		mockFrom.mockReturnValue({
			delete: vi.fn().mockReturnValue({
				eq: vi.fn().mockResolvedValue({
					data: null,
					error: { message: "Delete failed" },
				}),
			}),
		});

		const { deleteCabin } = await import("../apiCabins");
		await expect(deleteCabin(1)).rejects.toThrow("Cabins could not be deleted");
	});
});

// ────────────────────────────────────────────
// apiAuth
// ────────────────────────────────────────────
describe("apiAuth", () => {
	beforeEach(() => vi.clearAllMocks());

	it("login が正常にデータを返す", async () => {
		const mockData = { user: { id: "1" }, session: {} };
		mockAuth.signInWithPassword.mockResolvedValue({
			data: mockData,
			error: null,
		});

		const { login } = await import("../apiAuth");
		const result = await login({
			email: "test@test.com",
			password: "password",
		});
		expect(result).toEqual(mockData);
	});

	it("login がエラー時に例外を投げる", async () => {
		mockAuth.signInWithPassword.mockResolvedValue({
			data: null,
			error: { message: "Invalid credentials" },
		});

		const { login } = await import("../apiAuth");
		await expect(
			login({ email: "test@test.com", password: "wrong" })
		).rejects.toThrow("Invalid credentials");
	});

	it("getCurrentUser がセッション無しで null を返す", async () => {
		mockAuth.getSession.mockResolvedValue({
			data: { session: null },
		});

		const { getCurrentUser } = await import("../apiAuth");
		const result = await getCurrentUser();
		expect(result).toBeNull();
	});

	it("logout が正常に完了する", async () => {
		mockAuth.signOut.mockResolvedValue({ error: null });

		const { logout } = await import("../apiAuth");
		await expect(logout()).resolves.toBeUndefined();
	});
});

// ────────────────────────────────────────────
// apiBookings
// ────────────────────────────────────────────
describe("apiBookings", () => {
	beforeEach(() => vi.clearAllMocks());

	it("getBooking が Booking 詳細を返す", async () => {
		const mockBooking = {
			id: 1,
			status: "unconfirmed",
			cabins: { name: "Cabin 001" },
			guests: { fullName: "John" },
		};
		mockFrom.mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					single: vi
						.fn()
						.mockResolvedValue({ data: mockBooking, error: null }),
				}),
			}),
		});

		const { getBooking } = await import("../apiBookings");
		const result = await getBooking(1);
		expect(result.id).toBe(1);
	});

	it("deleteBooking がエラー時に例外を投げる", async () => {
		mockFrom.mockReturnValue({
			delete: vi.fn().mockReturnValue({
				eq: vi.fn().mockResolvedValue({
					data: null,
					error: { message: "Delete failed" },
				}),
			}),
		});

		const { deleteBooking } = await import("../apiBookings");
		await expect(deleteBooking(1)).rejects.toThrow(
			"Booking could not be deleted"
		);
	});

	it("updateBooking が更新済みデータを返す", async () => {
		const updated = { id: 1, status: "checked-in" };
		mockFrom.mockReturnValue({
			update: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					select: vi.fn().mockReturnValue({
						single: vi
							.fn()
							.mockResolvedValue({ data: updated, error: null }),
					}),
				}),
			}),
		});

		const { updateBooking } = await import("../apiBookings");
		const result = await updateBooking(1, { status: "checked-in" });
		expect(result.status).toBe("checked-in");
	});
});
