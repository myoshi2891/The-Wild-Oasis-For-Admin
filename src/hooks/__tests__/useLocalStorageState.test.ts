import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorageState } from "../useLocalStorageState";

describe("useLocalStorageState", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("初期値を返す", () => {
		const { result } = renderHook(() =>
			useLocalStorageState<boolean>(false, "testKey")
		);
		expect(result.current[0]).toBe(false);
	});

	it("localStorage に保存された値を読み込む", () => {
		localStorage.setItem("testKey", JSON.stringify(true));
		const { result } = renderHook(() =>
			useLocalStorageState<boolean>(false, "testKey")
		);
		expect(result.current[0]).toBe(true);
	});

	it("値を更新すると localStorage に同期される", () => {
		const { result } = renderHook(() =>
			useLocalStorageState<string>("initial", "testKey")
		);

		act(() => {
			result.current[1]("updated");
		});

		expect(result.current[0]).toBe("updated");
		expect(JSON.parse(localStorage.getItem("testKey")!)).toBe("updated");
	});

	it("不正な JSON があるとデフォルト値にフォールバックする", () => {
		localStorage.setItem("testKey", "invalid json");
		const { result } = renderHook(() =>
			useLocalStorageState<boolean>(false, "testKey")
		);
		expect(result.current[0]).toBe(false);
		// After effect, localStorage should be overwritten with the default
		expect(JSON.parse(localStorage.getItem("testKey")!)).toBe(false);
	});
});
