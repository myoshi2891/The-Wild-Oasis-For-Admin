import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithProviders } from "../../../test/testUtils";

vi.mock("../../../services/apiAuth");

import { getCurrentUser } from "../../../services/apiAuth";
import type { User } from "@supabase/supabase-js";
const mockGetCurrentUser = vi.mocked(getCurrentUser);

describe("useUser", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("ユーザーデータを取得して返す", async () => {
		const mockUser: Partial<User> = { id: "1", role: "authenticated", email: "a@b.com" };
		mockGetCurrentUser.mockResolvedValue(mockUser as User);

		const { useUser } = await import("../useUser");
		const { result } = renderHookWithProviders(() => useUser());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.user).toEqual(mockUser);
	});

	it("isAuthenticated が role === 'authenticated' のとき true", async () => {
		const mockUser: Partial<User> = { id: "1", role: "authenticated", email: "a@b.com" };
		mockGetCurrentUser.mockResolvedValue(mockUser as User);

		const { useUser } = await import("../useUser");
		const { result } = renderHookWithProviders(() => useUser());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.isAuthenticated).toBe(true);
	});

	it("ユーザーが null の場合 isAuthenticated は false", async () => {
		mockGetCurrentUser.mockResolvedValue(null);

		const { useUser } = await import("../useUser");
		const { result } = renderHookWithProviders(() => useUser());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.isAuthenticated).toBe(false);
	});

	it("ローディング中は isLoading が true", async () => {
		mockGetCurrentUser.mockImplementation(
			() => new Promise(() => {}) // never resolves
		);

		const { useUser } = await import("../useUser");
		const { result } = renderHookWithProviders(() => useUser());

		expect(result.current.isLoading).toBe(true);
	});
});
