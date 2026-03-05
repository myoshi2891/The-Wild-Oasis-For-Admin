import { test, expect } from "./fixtures";

test.describe("アカウント", () => {
	test("アカウントページが表示される", async ({ page }) => {
		await page.goto("/account");

		await expect(
			page.getByRole("heading", { name: /update your account/i })
		).toBeVisible({ timeout: 15_000 });
	});

	test("ダークモード切替が動作する", async ({ page }) => {
		await page.goto("/account");
		await expect(page).toHaveURL(/account/);

		// ダークモードトグルボタン（header 内のボタン）
		const header = page.locator("header");
		const darkModeButton = header.locator("button").nth(1);

		// 初期状態
		const isDarkBefore = await page.evaluate(() =>
			document.documentElement.classList.contains("dark-mode")
		);

		// トグルクリック
		await darkModeButton.click();

		// 切り替わったこと
		const isDarkAfter = await page.evaluate(() =>
			document.documentElement.classList.contains("dark-mode")
		);

		expect(isDarkBefore).not.toBe(isDarkAfter);

		// 元に戻す
		await darkModeButton.click();
	});
});
