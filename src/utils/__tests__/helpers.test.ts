import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { subtractDates, formatDistanceFromNow, getToday, formatCurrency } from "../helpers";

describe("subtractDates", () => {
	it("2つの日付文字列の日数差を返す", () => {
		expect(subtractDates("2024-02-10", "2024-02-05")).toBe(5);
	});

	it("同じ日付の場合は 0 を返す", () => {
		expect(subtractDates("2024-02-05", "2024-02-05")).toBe(0);
	});

	it("逆順の日付の場合は負の値を返す", () => {
		expect(subtractDates("2024-02-05", "2024-02-10")).toBe(-5);
	});
});

describe("formatDistanceFromNow", () => {
	it("ISO日付文字列から相対的な距離を返す", () => {
		const result = formatDistanceFromNow(new Date().toISOString());
		expect(typeof result).toBe("string");
		expect(result.length).toBeGreaterThan(0);
	});
});

describe("getToday", () => {
	it("ISO 日付文字列を返す", () => {
		const result = getToday();
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
	});

	it("デフォルトでは時刻が 00:00:00.000 に設定される", () => {
		const result = getToday();
		expect(result).toContain("T00:00:00.000Z");
	});

	it("end オプションで時刻が 23:59:59.999 に設定される", () => {
		const result = getToday({ end: true });
		expect(result).toContain("T23:59:59.999Z");
	});
});

describe("formatCurrency", () => {
	it("USD 通貨フォーマットで値を返す", () => {
		const result = formatCurrency(1234.5);
		expect(result).toBe("$1,234.50");
	});

	it("0 を正しくフォーマットする", () => {
		expect(formatCurrency(0)).toBe("$0.00");
	});

	it("負の値を正しくフォーマットする", () => {
		const result = formatCurrency(-100);
		expect(result).toBe("-$100.00");
	});
});
