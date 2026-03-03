import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useOutsideClick } from "../useOutsideClick";

describe("useOutsideClick", () => {
	it("ref オブジェクトを返す", () => {
		const handler = vi.fn();
		const { result } = renderHook(() => useOutsideClick(handler));
		expect(result.current).toBeDefined();
		expect(result.current).toHaveProperty("current");
	});
});
