import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { DarkModeProvider, useDarkMode } from "../DarkModeContext";

const originalMatchMedia = window.matchMedia;

beforeAll(() => {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation((query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});
});

afterAll(() => {
	window.matchMedia = originalMatchMedia;
});

describe("DarkModeContext", () => {
	it("Provider 内で useDarkMode が値を返す", () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<DarkModeProvider>{children}</DarkModeProvider>
		);

		const { result } = renderHook(() => useDarkMode(), { wrapper });
		expect(result.current).toHaveProperty("isDarkMode");
		expect(result.current).toHaveProperty("toggleDarkMode");
		expect(typeof result.current.toggleDarkMode).toBe("function");
	});

	it("Provider 外で useDarkMode を使うとエラーを投げる", () => {
		expect(() => {
			renderHook(() => useDarkMode());
		}).toThrow("DarkModeContext was used outside of DarkModeProvider");
	});
});
