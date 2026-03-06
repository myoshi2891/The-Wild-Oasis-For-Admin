import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import {
	mockToast,
	renderHookWithProviders,
	createTestQueryClient,
} from "../../../test/testUtils";

vi.mock("../../../services/apiAuth");

import { updateCurrentUser } from "../../../services/apiAuth";
import type { User } from "@supabase/supabase-js";
const mockUpdateCurrentUser = vi.mocked(updateCurrentUser);

describe("useUpdateUser", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("更新成功時にユーザーキャッシュを更新しトーストを表示する", async () => {
		const updatedUser: Partial<User> = { id: "1", role: "authenticated", email: "a@b.com" };
		mockUpdateCurrentUser.mockResolvedValue({ user: updatedUser as User });

		const { useUpdateUser } = await import("../useUpdateUser");
		const queryClient = createTestQueryClient();
		const { result } = renderHookWithProviders(() => useUpdateUser(), {
			queryClient,
		});

		result.current.updateUser({ fullName: "Updated Name" });

		await waitFor(() => {
			expect(mockToast.success).toHaveBeenCalledWith(
				"User account successfully updated."
			);
		});

		expect(queryClient.getQueryData(["user"])).toEqual(updatedUser);
	});

	it("更新失敗時にエラートーストを表示する", async () => {
		mockUpdateCurrentUser.mockRejectedValue(new Error("Update failed"));

		const { useUpdateUser } = await import("../useUpdateUser");
		const { result } = renderHookWithProviders(() => useUpdateUser());

		result.current.updateUser({ password: "newpass" });

		await waitFor(() => {
			expect(mockToast.error).toHaveBeenCalledWith("Update failed");
		});
	});
});
