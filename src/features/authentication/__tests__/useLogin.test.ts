import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import {
	mockNavigate,
	mockToast,
	renderHookWithProviders,
	createTestQueryClient,
} from "../../../test/testUtils";

vi.mock("../../../services/apiAuth");

import { login as loginApi } from "../../../services/apiAuth";
const mockLoginApi = vi.mocked(loginApi);

describe("useLogin", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("isLoading が初期状態で false である", async () => {
		const { useLogin } = await import("../useLogin");
		const { result } = renderHookWithProviders(() => useLogin());
		expect(result.current.isLoading).toBe(false);
		expect(typeof result.current.login).toBe("function");
	});

	it("login 成功時に queryData をセットし /dashboard へ遷移する", async () => {
		const mockUser = { user: { id: "1", role: "authenticated" } as any, session: {} as any };
		mockLoginApi.mockResolvedValue(mockUser);

		const { useLogin } = await import("../useLogin");
		const queryClient = createTestQueryClient();
		const { result } = renderHookWithProviders(() => useLogin(), {
			queryClient,
		});

		result.current.login({ email: "test@test.com", password: "password" });

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith("/dashboard", {
				replace: true,
			});
		});

		expect(queryClient.getQueryData(["user"])).toEqual(mockUser.user);
	});

	it("login 失敗時にエラートーストを表示する", async () => {
		mockLoginApi.mockRejectedValue(new Error("Invalid credentials"));

		const { useLogin } = await import("../useLogin");
		const { result } = renderHookWithProviders(() => useLogin());

		result.current.login({ email: "test@test.com", password: "wrong" });

		await waitFor(() => {
			expect(mockToast.error).toHaveBeenCalledWith(
				"Provided email and password are incorrect..."
			);
		});
	});
});
