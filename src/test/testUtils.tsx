/* eslint-disable react-refresh/only-export-components */
/**
 * テスト共通ユーティリティ
 * QueryClient / MemoryRouter / styled-components をラップするヘルパー
 */

import React, { type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import type { StayAfterDate } from "../types/domain";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";
import {
	render,
	renderHook,
	type RenderOptions,
	type RenderHookOptions,
	type RenderHookResult,
	type RenderResult,
} from "@testing-library/react";
import { vi, beforeEach } from "vitest";

// ── Clear LocalStorage globally for test wrapper scopes ────────
beforeEach(() => {
	localStorage.clear();
});

import { DarkModeProvider } from "../context/DarkModeContext";
import Table from "../ui/Table";
import Menus from "../ui/Menus";

// ── Mock: react-router-dom navigate ─────────────────────────
export const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
	const actual =
		await vi.importActual<typeof import("react-router-dom")>(
			"react-router-dom"
		);
	return { ...actual, useNavigate: () => mockNavigate };
});

// ── Mock: react-hot-toast ───────────────────────────────────
export const mockToast = {
	success: vi.fn(),
	error: vi.fn(),
};

vi.mock("react-hot-toast", () => ({
	default: {
		success: (...args: unknown[]) => mockToast.success(...args),
		error: (...args: unknown[]) => mockToast.error(...args),
	},
}));

/**
 * Create a mock User object with sensible default fields for tests.
 *
 * @param overrides - Partial fields to merge into the default mock user
 * @returns A `User` object composed of the defaults with any `overrides` applied
 */
export function makeMockUser(overrides: Partial<User> = {}): User {
	const base: User = {
		id: "1",
		app_metadata: {},
		user_metadata: {},
		aud: "authenticated",
		created_at: "2023-01-01T00:00:00.000Z",
		email: "test@test.com",
		phone: "",
		role: "authenticated",
		updated_at: "2023-01-01T00:00:00.000Z",
		identities: [],
		factors: [],
	};
	return { ...base, ...overrides };
}

/**
 * Create a mock Session object linked to the given User.
 *
 * @param user - The User to include on the returned Session
 * @returns A Session containing mock access and refresh tokens, `expires_in` and `expires_at` values, `token_type: "bearer"`, and the provided `user`
 */
export function makeMockSession(user: User): Session {
	return {
		access_token: "mock-access-token",
		refresh_token: "mock-refresh-token",
		expires_in: 3600,
		expires_at: 1000000000,
		token_type: "bearer",
		user,
	};
}

/**
 * Builds a StayAfterDate object populated with sensible default values for tests.
 *
 * @param overrides - Partial fields to override the defaults in the returned StayAfterDate
 * @returns A StayAfterDate object with the defaults applied and any `overrides` values replacing them
 */
export function createMockStay(overrides: Partial<StayAfterDate>): StayAfterDate {
	return {
		id: 1, created_at: "2023-01-01", startDate: "2023-01-01", endDate: "2023-01-02",
		numNights: 1, numGuests: 1, cabinPrice: 100, extrasPrice: 0, totalPrice: 100,
		status: "unconfirmed", hasBreakfast: false, isPaid: false, observations: "",
		cabinId: 1, guestId: 1, guests: { fullName: "Test" },
		...overrides,
	};
}

// ── QueryClient factory ─────────────────────────────────────
/**
 * Create a QueryClient preconfigured for tests.
 *
 * - queries: retry=false, gcTime=Infinity, staleTime=0
 * - mutations: retry=false
 *
 * @returns A QueryClient configured for tests: query and mutation retries disabled, query `gcTime` set to `Infinity`, and `staleTime` set to `0`.
 */
export function createTestQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				// React Query v5 で cacheTime は gcTime にリネームされた
				gcTime: Infinity,
				// staleTime はリポジトリルールにより 0 をデフォルトとする。
				// 個別テストで非 0 が必要な場合は useQuery の staleTime で上書きすること。
				staleTime: 0,
			},
			mutations: {
				retry: false,
			},
		},
	});
}

// ── Provider wrapper ────────────────────────────────────────
interface WrapperOptions {
	queryClient?: QueryClient;
	routerProps?: MemoryRouterProps;
}

/**
 * Create a React wrapper that provides QueryClient, DarkMode, and MemoryRouter to children for testing.
 *
 * @param options - Optional configuration for the wrapper
 * @param options.queryClient - QueryClient instance to use; when omitted a test QueryClient is created
 * @param options.routerProps - Props forwarded to the MemoryRouter
 * @returns A React component that wraps its children with QueryClientProvider, DarkModeProvider, and MemoryRouter
 */
function createWrapper({ queryClient, routerProps }: WrapperOptions = {}) {
	const client = queryClient ?? createTestQueryClient();

	return function TestWrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={client}>
				<DarkModeProvider>
					<MemoryRouter {...routerProps}>
						{children}
					</MemoryRouter>
				</DarkModeProvider>
			</QueryClientProvider>
		);
	};
}

/**
 * Render children inside a configurable Table wrapper with Menus.
 * 
 * @param children - Elements to render inside the Menus (typically table cell/row content)
 * @param columns - Grid layout columns definition
 * @returns A React element: a `Table` with configured columns whose content is the provided `children` wrapped by `Menus`
 */
export function TableProviders({ children, columns = "1fr" }: { children: ReactNode; columns?: string }) {
	return (
		<Table columns={columns}>
			<Menus>{children}</Menus>
		</Table>
	);
}

// ── renderWithProviders ─────────────────────────────────────
interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
	queryClient?: QueryClient;
	routerProps?: MemoryRouterProps;
}

/**
 * Render a React element wrapped with test QueryClient and MemoryRouter providers.
 *
 * Renders the provided UI using React Testing Library while supplying a QueryClient and MemoryRouter so components that use TanStack Query or react-router work in tests.
 *
 * @param ui - The React element to render.
 * @param options - Optional rendering options.
 *   - `queryClient`: a QueryClient instance to use for the render; if omitted a test QueryClient is created.
 *   - `routerProps`: props forwarded to React Router's MemoryRouter.
 *   - Any other RenderOptions are passed through to React Testing Library's `render`.
 * @returns The RenderResult from React Testing Library augmented with the `queryClient` instance used for the render.
 */
export function renderWithProviders(
	ui: React.ReactElement,
	options: RenderWithProvidersOptions = {}
): RenderResult & { queryClient: QueryClient } {
	const { queryClient, routerProps, ...renderOptions } = options;
	const client = queryClient ?? createTestQueryClient();

	const result = render(ui, {
		wrapper: createWrapper({ queryClient: client, routerProps }),
		...renderOptions,
	});

	return { ...result, queryClient: client };
}

// ── renderHookWithProviders ─────────────────────────────────
interface RenderHookWithProvidersOptions<TProps>
	extends Omit<RenderHookOptions<TProps>, "wrapper"> {
	queryClient?: QueryClient;
	routerProps?: MemoryRouterProps;
}

/**
 * Renders a hook with QueryClientProvider and MemoryRouter wrappers for testing.
 *
 * Renders the provided hook inside a test QueryClient and a MemoryRouter, returning the hook rendering result along with the QueryClient instance used.
 *
 * @param hook - The hook function to render. Accepts props of type `TProps` and returns `TResult`.
 * @param options - Optional render options. `options.queryClient` can provide a custom QueryClient; `options.routerProps` are forwarded to MemoryRouter. Other renderHook options may be supplied.
 * @returns The RenderHookResult for the rendered hook, augmented with the `queryClient` instance used during rendering.
 */
export function renderHookWithProviders<TResult, TProps = undefined>(
	hook: (props: TProps) => TResult,
	options: RenderHookWithProvidersOptions<TProps> = {}
): RenderHookResult<TResult, TProps> & { queryClient: QueryClient } {
	const { queryClient, routerProps, ...hookOptions } = options;
	const client = queryClient ?? createTestQueryClient();

	const result = renderHook(hook, {
		wrapper: createWrapper({ queryClient: client, routerProps }),
		...hookOptions,
	});

	return { ...result, queryClient: client };
}
