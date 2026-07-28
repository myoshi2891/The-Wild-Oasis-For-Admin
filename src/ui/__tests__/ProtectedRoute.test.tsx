import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "../ProtectedRoute";

// useUser のモック
const mockUseUser = vi.fn();
vi.mock("../../features/authentication/useUser", () => ({
	useUser: () => mockUseUser(),
}));

// useNavigate のモック
const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

function renderProtectedRoute() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>
		</QueryClientProvider>
	);
}

describe("ProtectedRoute", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("認証済みの場合に children を表示する", () => {
		mockUseUser.mockReturnValue({
			isLoading: false,
			isAuthenticated: true,
			user: { id: "1", role: "authenticated" },
		});

		renderProtectedRoute();
		expect(screen.getByText("Protected Content")).toBeInTheDocument();
	});

	it("未認証の場合に /login へリダイレクトする", async () => {
		mockUseUser.mockReturnValue({
			isLoading: false,
			isAuthenticated: false,
			user: null,
		});

		renderProtectedRoute();

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith("/login");
		});
	});

	it("ローディング中は children を表示しない", () => {
		mockUseUser.mockReturnValue({
			isLoading: true,
			isAuthenticated: false,
			user: null,
		});

		renderProtectedRoute();
		expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
	});
});
