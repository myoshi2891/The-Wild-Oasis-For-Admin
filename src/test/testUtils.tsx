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
 * テスト用 QueryClient を生成する。
 *
 * - queries: retry=false, cacheTime=Infinity, staleTime=0
 * - mutations: retry=false
 * - logger: no-op（コンソール出力を抑制）
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
