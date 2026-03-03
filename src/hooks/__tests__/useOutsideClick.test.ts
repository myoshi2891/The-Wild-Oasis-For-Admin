import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, fireEvent } from "@testing-library/react";
import { useOutsideClick } from "../useOutsideClick";

describe("useOutsideClick", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("ref オブジェクトを返す", () => {
		const handler = vi.fn();
		const { result } = renderHook(() => useOutsideClick(handler));
		expect(result.current).toBeDefined();
		expect(result.current).toHaveProperty("current");
	});

	it("ref 要素の外側をクリックするとハンドラーが呼ばれる", () => {
		const handler = vi.fn();
		const { result } = renderHook(() =>
			useOutsideClick<HTMLDivElement>(handler)
		);

		// Create and attach a DOM element to the ref
		const inside = document.createElement("div");
		document.body.appendChild(inside);
		// Assign ref
		Object.defineProperty(result.current, "current", {
			writable: true,
			value: inside,
		});

		// Click outside (on document body, not inside)
		fireEvent.click(document.body);

		expect(handler).toHaveBeenCalledTimes(1);
	});

	it("ref 要素の内側をクリックするとハンドラーは呼ばれない", () => {
		const handler = vi.fn();
		const { result } = renderHook(() =>
			useOutsideClick<HTMLDivElement>(handler)
		);

		const inside = document.createElement("div");
		document.body.appendChild(inside);
		Object.defineProperty(result.current, "current", {
			writable: true,
			value: inside,
		});

		// Click inside the ref element
		fireEvent.click(inside);

		expect(handler).not.toHaveBeenCalled();
	});
});
