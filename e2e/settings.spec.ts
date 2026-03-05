import { test, expect } from "./fixtures";

test.describe("設定", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/settings");
		await expect(page.locator("#min-nights")).toBeVisible({
			timeout: 15_000,
		});
	});

	test("設定フォームが表示される", async ({ page }) => {
		await expect(page.locator("#min-nights")).toBeVisible();
		await expect(page.locator("#max-nights")).toBeVisible();
		await expect(page.locator("#max-guests")).toBeVisible();
		await expect(page.locator("#breakfast-price")).toBeVisible();
	});

	test("設定値を変更するとサーバーに保存される", async ({ page }) => {
		const minNights = page.locator("#min-nights");

		// 現在の値を取得
		const originalValue = await minNights.inputValue();

		// 値を変更して blur
		await minNights.clear();
		await minNights.fill("5");
		await minNights.blur();

		// 少し待ってリロード
		await page.waitForTimeout(1000);
		await page.reload();

		// 変更が保存されている
		await expect(page.locator("#min-nights")).toHaveValue("5", {
			timeout: 10_000,
		});

		// 元の値に戻す
		await page.locator("#min-nights").clear();
		await page.locator("#min-nights").fill(originalValue);
		await page.locator("#min-nights").blur();
		await page.waitForTimeout(500);
	});
});
