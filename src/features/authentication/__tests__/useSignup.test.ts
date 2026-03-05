import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { mockToast, renderHookWithProviders } from "../../../test/testUtils";

vi.mock("../../../services/apiAuth");

import { signup as signupApi } from "../../../services/apiAuth";
const mockSignupApi = vi.mocked(signupApi);

describe("useSignup", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("isLoading が初期状態で false である", async () => {
		const { useSignup } = await import("../useSignup");
		const { result } = renderHookWithProviders(() => useSignup());
		expect(result.current.isLoading).toBe(false);
		expect(typeof result.current.signup).toBe("function");
	});

	it("signup 成功時にトーストを表示する", async () => {
		const mockData = { user: { id: "1" } as any, session: {} as any };
		mockSignupApi.mockResolvedValue(mockData);

		const { useSignup } = await import("../useSignup");
		const { result } = renderHookWithProviders(() => useSignup());

		result.current.signup({
			fullName: "Test User",
			email: "test@test.com",
			password: "password123",
			passwordConfirm: "password123",
		});

		await waitFor(() => {
			expect(mockToast.success).toHaveBeenCalledWith(
				expect.stringContaining("Account successfully created")
			);
		});
	});
});
