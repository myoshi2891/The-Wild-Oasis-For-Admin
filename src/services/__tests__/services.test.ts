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
	beforeEach(() => {
		vi.resetAllMocks();
		mockStorage.from.mockReturnValue({
			upload: vi.fn().mockResolvedValue({ error: null }),
		});
	});

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
	beforeEach(() => {
		vi.resetAllMocks();
		mockStorage.from.mockReturnValue({
			upload: vi.fn().mockResolvedValue({ error: null }),
		});
	});

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
	beforeEach(() => {
		vi.resetAllMocks();
		mockStorage.from.mockReturnValue({
			upload: vi.fn().mockResolvedValue({ error: null }),
		});
	});

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
	beforeEach(() => {
		vi.resetAllMocks();
		mockStorage.from.mockReturnValue({
			upload: vi.fn().mockResolvedValue({ error: null }),
		});
	});

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

// ────────────────────────────────────────────
// apiSettings — updateSetting
// ────────────────────────────────────────────
describe("apiSettings (updateSetting)", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockStorage.from.mockReturnValue({
			upload: vi.fn().mockResolvedValue({ error: null }),
		});
	});

	it("updateSetting が更新済み Settings を返す", async () => {
		const updatedSettings = {
			id: 1,
			minBookingLength: 3,
			maxBookingLength: 90,
			maxGuestsPerBooking: 8,
			breakfastPrice: 20,
		};
		mockFrom.mockReturnValue({
			update: vi.fn().mockReturnValue({
				select: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						single: vi
							.fn()
							.mockResolvedValue({ data: updatedSettings, error: null }),
					}),
				}),
			}),
		});

		const { updateSetting } = await import("../apiSettings");
		const result = await updateSetting({ breakfastPrice: 20 });
		expect(result).toEqual(updatedSettings);
		expect(mockFrom).toHaveBeenCalledWith("settings");
	});

	it("updateSetting がエラー時に例外を投げる", async () => {
		mockFrom.mockReturnValue({
			update: vi.fn().mockReturnValue({
				select: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({
							data: null,
							error: { message: "Update failed" },
						}),
					}),
				}),
			}),
		});

		const { updateSetting } = await import("../apiSettings");
		await expect(updateSetting({ breakfastPrice: 20 })).rejects.toThrow(
			"Settings could not be updated"
		);
	});
});

// ────────────────────────────────────────────
// apiCabins — createEditCabin
// ────────────────────────────────────────────
describe("apiCabins (createEditCabin)", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockStorage.from.mockReturnValue({
			upload: vi.fn().mockResolvedValue({ error: null }),
		});
	});

	const baseCabin = {
		name: "Cabin 001",
		maxCapacity: 4,
		regularPrice: 250,
		discount: 50,
		description: "A cozy cabin",
	};

	it("既存画像URLで新規作成する場合、DB insertのみ実行する", async () => {
		const created = { id: 1, ...baseCabin, image: "https://test.supabase.co/img.jpg" };
		mockFrom.mockReturnValue({
			insert: vi.fn().mockReturnValue({
				select: vi.fn().mockReturnValue({
					single: vi
						.fn()
						.mockResolvedValue({ data: created, error: null }),
				}),
			}),
		});

		const { createEditCabin } = await import("../apiCabins");
		const result = await createEditCabin({
			...baseCabin,
			image: "https://test.supabase.co/img.jpg",
		});
		expect(result).toEqual(created);
		// Storage should not be called for existing image URLs
		expect(mockStorage.from).not.toHaveBeenCalled();
	});

	it("画像アップロード失敗時にcabinを削除してエラーを投げる", async () => {
		const created = { id: 10, ...baseCabin, image: "path" };
		const mockFile = new File(["data"], "cabin.jpg", { type: "image/jpeg" });

		mockFrom.mockReturnValue({
			insert: vi.fn().mockReturnValue({
				select: vi.fn().mockReturnValue({
					single: vi
						.fn()
						.mockResolvedValue({ data: created, error: null }),
				}),
			}),
			delete: vi.fn().mockReturnValue({
				eq: vi.fn().mockResolvedValue({ data: null, error: null }),
			}),
		});

		// Mock storage upload failure
		mockStorage.from.mockReturnValue({
			upload: vi.fn().mockResolvedValue({ error: { message: "Upload failed" } }),
		});

		const { createEditCabin } = await import("../apiCabins");
		await expect(
			createEditCabin({ ...baseCabin, image: mockFile })
		).rejects.toThrow("Cabin image could not be uploaded");

		// Verify rollback: cabin should be deleted
		expect(mockFrom).toHaveBeenCalledWith("cabins");
		const cabinsCallResult = mockFrom.mock.results.find(
			(_, i) => mockFrom.mock.calls[i][0] === "cabins" && i > 0
		);
		expect(cabinsCallResult).toBeDefined();
	});

	it("既存cabinを編集する", async () => {
		const edited = { id: 5, ...baseCabin, image: "https://test.supabase.co/img.jpg" };
		mockFrom.mockReturnValue({
			update: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					select: vi.fn().mockReturnValue({
						single: vi
							.fn()
							.mockResolvedValue({ data: edited, error: null }),
					}),
				}),
			}),
		});

		const { createEditCabin } = await import("../apiCabins");
		const result = await createEditCabin(
			{ ...baseCabin, image: "https://test.supabase.co/img.jpg" },
			5
		);
		expect(result).toEqual(edited);
	});
});

// ────────────────────────────────────────────
// apiAuth — signup / updateCurrentUser
// ────────────────────────────────────────────
describe("apiAuth (signup/updateCurrentUser)", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockStorage.from.mockReturnValue({
			upload: vi.fn().mockResolvedValue({ error: null }),
		});
	});

	it("signup が正常にデータを返す", async () => {
		const mockData = { user: { id: "1" }, session: {} };
		mockAuth.signUp.mockResolvedValue({ data: mockData, error: null });

		const { signup } = await import("../apiAuth");
		const result = await signup({
			fullName: "Test User",
			email: "test@test.com",
			password: "password123",
			passwordConfirm: "password123",
		});
		expect(result).toEqual(mockData);
	});

	it("signup がエラー時に例外を投げる", async () => {
		mockAuth.signUp.mockResolvedValue({
			data: null,
			error: { message: "Signup failed" },
		});

		const { signup } = await import("../apiAuth");
		await expect(
			signup({
				fullName: "Test User",
				email: "test@test.com",
				password: "password123",
				passwordConfirm: "password123",
			})
		).rejects.toThrow("Signup failed");
	});

	it("updateCurrentUser がパスワード更新を実行する", async () => {
		const mockData = { user: { id: "1" } };
		mockAuth.updateUser.mockResolvedValue({ data: mockData, error: null });

		const { updateCurrentUser } = await import("../apiAuth");
		const result = await updateCurrentUser({ password: "newpass123" });
		expect(result).toEqual(mockData);
		expect(mockAuth.updateUser).toHaveBeenCalledWith({ password: "newpass123" });
	});

	it("updateCurrentUser がデータ無しでエラーを投げる", async () => {
		const { updateCurrentUser } = await import("../apiAuth");
		await expect(updateCurrentUser({})).rejects.toThrow(
			"No update data provided"
		);
	});

	it("updateCurrentUser がアバターアップロードを含む更新を実行する", async () => {
		const mockFile = new File(["avatar"], "avatar.jpg", { type: "image/jpeg" });
		const firstUpdate = { user: { id: "user-1" } };
		const secondUpdate = { user: { id: "user-1", avatar: "url" } };

		mockAuth.updateUser
			.mockResolvedValueOnce({ data: firstUpdate, error: null })
			.mockResolvedValueOnce({ data: secondUpdate, error: null });

		mockStorage.from.mockReturnValue({
			upload: vi.fn().mockResolvedValue({ error: null }),
		});

		const { updateCurrentUser } = await import("../apiAuth");
		const result = await updateCurrentUser({
			fullName: "Updated Name",
			avatar: mockFile,
		});
		expect(result).toEqual(secondUpdate);
		expect(mockAuth.updateUser).toHaveBeenCalledTimes(2);
	});
});
