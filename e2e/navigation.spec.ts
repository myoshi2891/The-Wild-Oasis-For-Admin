import { test, expect } from "./fixtures";

test.describe("ナビゲーション", () => {
	test("サイドバーの各リンクが正しいページへ遷移する", async ({ page }) => {
		await page.goto("/dashboard");
		await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 });

		// Bookings リンク
		await page.getByRole("link", { name: "Bookings" }).click();
		await expect(page).toHaveURL(/bookings/);

		// Cabins リンク
		await page.getByRole("link", { name: "Cabins" }).click();
		await expect(page).toHaveURL(/cabins/);

		// Settings リンク
		await page.getByRole("link", { name: "Settings" }).click();
		await expect(page).toHaveURL(/settings/);

		// Home (Dashboard) リンク
		await page.getByRole("link", { name: "Home" }).click();
		await expect(page).toHaveURL(/dashboard/);
	});

	test("存在しないパスで PageNotFound が表示される", async ({ page }) => {
		await page.goto("/nonexistent-page");

		await expect(
			page.getByText(/could not be found/i)
		).toBeVisible({ timeout: 15_000 });
	});
});
