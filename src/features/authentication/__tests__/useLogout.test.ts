import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import {
	mockNavigate,
	renderHookWithProviders,
	createTestQueryClient,
} from "../../../test/testUtils";

vi.mock("../../../services/apiAuth");

import { logout as logoutApi } from "../../../services/apiAuth";
const mockLogoutApi = vi.mocked(logoutApi);

describe("useLogout", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("isLoading が初期状態で false である", async () => {
		const { useLogout } = await import("../useLogout");
		const { result } = renderHookWithProviders(() => useLogout());
		expect(result.current.isLoading).toBe(false);
		expect(typeof result.current.logout).toBe("function");
	});

	it("logout 成功時にクエリを全削除し /login へ遷移する", async () => {
		mockLogoutApi.mockResolvedValue(undefined);

		const { useLogout } = await import("../useLogout");
		const queryClient = createTestQueryClient();
		// Seed some cache data to verify it gets removed
		queryClient.setQueryData(["user"], { id: "1" });

		const removeQueriesSpy = vi.spyOn(queryClient, "removeQueries");
		const { result } = renderHookWithProviders(() => useLogout(), {
			queryClient,
		});

		result.current.logout();

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
		});

		expect(removeQueriesSpy).toHaveBeenCalled();
	});
});
