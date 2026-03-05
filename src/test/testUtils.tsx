/**
 * テスト共通ユーティリティ
 * QueryClient / MemoryRouter / styled-components をラップするヘルパー
 */

import React, { type ReactNode } from "react";
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
import { vi } from "vitest";

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

// ── QueryClient factory ─────────────────────────────────────
/**
 * Create a QueryClient configured for tests.
 *
 * Configures queries to not retry, use an infinite cacheTime, and a staleTime of 0; configures mutations to not retry; and installs a no-op logger to suppress console output during tests.
 *
 * @returns A QueryClient with query retries disabled, query `cacheTime` set to `Infinity`, query `staleTime` set to `0`, mutation retries disabled, and a no-op logger.
 */
export function createTestQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				cacheTime: Infinity,
				// staleTime はリポジトリルールにより 0 をデフォルトとする。
				// 個別テストで非 0 が必要な場合は useQuery の staleTime で上書きすること。
				staleTime: 0,
			},
			mutations: {
				retry: false,
			},
		},
		logger: {
			log: () => {},
			warn: () => {},
			error: () => {},
		},
	});
}

// ── Provider wrapper ────────────────────────────────────────
interface WrapperOptions {
	queryClient?: QueryClient;
	routerProps?: MemoryRouterProps;
}

/**
 * Create a React wrapper component that provides a QueryClient and MemoryRouter to its children for testing.
 *
 * @param options - Optional configuration for the wrapper
 * @param options.queryClient - QueryClient instance to use; if omitted a new test QueryClient is created
 * @param options.routerProps - Props forwarded to the MemoryRouter
 * @returns A React component that wraps its children with a QueryClientProvider (using the provided or created client) and a MemoryRouter (using the provided router props)
 */
function createWrapper({ queryClient, routerProps }: WrapperOptions = {}) {
	const client = queryClient ?? createTestQueryClient();

	return function TestWrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={client}>
				<MemoryRouter {...routerProps}>{children}</MemoryRouter>
			</QueryClientProvider>
		);
	};
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
