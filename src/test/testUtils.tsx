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
 * Create a QueryClient configured for testing with stable, non-retrying behavior.
 *
 * - queries: retry=false, cacheTime=Infinity, staleTime=0
 * - mutations: retry=false
 * - logger: no-op（コンソール出力を抑制）
 *
 * @returns A QueryClient configured for tests: query and mutation retries disabled, query `cacheTime` set to `Infinity`, `staleTime` set to `0`, and a no-op logger.
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
 * Creates a React test wrapper component that provides a QueryClient and a MemoryRouter.
 *
 * @param queryClient - Optional QueryClient to use for queries; if omitted, a test QueryClient is created.
 * @param routerProps - Optional props forwarded to the underlying MemoryRouter.
 * @returns A React component that renders its children wrapped with a QueryClientProvider and a MemoryRouter configured with `routerProps`.
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
 * Renders a React element wrapped with a Test QueryClientProvider and MemoryRouter.
 *
 * @param ui - The React element to render.
 * @param options - Optional settings for rendering.
 * @param options.queryClient - An existing QueryClient to provide to the rendered tree. If omitted, a test QueryClient is created.
 * @param options.routerProps - Props forwarded to MemoryRouter to control initial entries or basename.
 * @returns The React Testing Library render result augmented with the `queryClient` instance used for the render.
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
 * Renders a hook within test providers (QueryClientProvider and MemoryRouter).
 *
 * @param hook - The hook function to render; receives `props` of type `TProps`.
 * @param options - Optional settings. May include `queryClient` to reuse an existing QueryClient, `routerProps` for MemoryRouter, and any other options forwarded to `renderHook`.
 * @returns The original `RenderHookResult` augmented with the `queryClient` instance used for the render.
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
