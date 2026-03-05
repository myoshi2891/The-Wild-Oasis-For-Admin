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

		try {
			// 値を変更して blur
			await minNights.clear();
			await minNights.fill("5");
			await minNights.blur();

			// リロードして反映を待機
			await page.reload();

			// 変更が保存されていることを確認
			await expect(minNights).toHaveValue("5", {
				timeout: 10_000,
			});
		} finally {
			// 例外発生時も含めて元の値に確実に戻す
			await minNights.clear();
			await minNights.fill(originalValue);
			await minNights.blur();
			// 元に戻ったことを確認して待機
			await expect(minNights).toHaveValue(originalValue, {
				timeout: 10_000,
			});
		}
	});
});
