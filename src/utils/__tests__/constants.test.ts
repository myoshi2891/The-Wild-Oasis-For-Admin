import { describe, it, expect } from "vitest";
import { PAGE_SIZE } from "../constants";

describe("constants", () => {
	it("PAGE_SIZE は 10 である", () => {
		expect(PAGE_SIZE).toBe(10);
	});

	it("PAGE_SIZE は number 型である", () => {
		expect(typeof PAGE_SIZE).toBe("number");
	});
});
