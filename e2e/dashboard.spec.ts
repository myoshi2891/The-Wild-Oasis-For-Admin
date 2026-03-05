import { test, expect } from "./fixtures";

test.describe("ダッシュボード", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/dashboard");
		// ダッシュボードが完全にロードされるまで待機
		await expect(
			page.getByRole("heading", { name: "Booking", level: 5 })
		).toBeVisible({ timeout: 15_000 });
	});

	test("統計カードが表示される", async ({ page }) => {
		await expect(
			page.getByRole("heading", { name: "Booking", level: 5 })
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Sales", level: 5 })
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Check ins", level: 5 })
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Occupancy rate", level: 5 })
		).toBeVisible();
	});

	test("日数フィルター（7/30/90日）が動作する", async ({ page }) => {
		const last7 = page.getByRole("button", { name: "Last 7 days" });
		const last30 = page.getByRole("button", { name: "Last 30 days" });
		const last90 = page.getByRole("button", { name: "Last 90 days" });

		await expect(last7).toBeVisible();
		await expect(last30).toBeVisible();
		await expect(last90).toBeVisible();

		// 30 days に切り替え
		await last30.click();
		await expect(page).toHaveURL(/last=30/);

		// 90 days に切り替え
		await last90.click();
		await expect(page).toHaveURL(/last=90/);
	});

	test("Today's Activity セクションが表示される", async ({ page }) => {
		await expect(
			page.getByRole("heading", { name: "Today's Activity", level: 2 })
		).toBeVisible();
	});

	test("Sales チャートが描画される", async ({ page }) => {
		await expect(
			page.getByRole("heading", { name: /Sales from/, level: 2 })
		).toBeVisible();
	});

	test("Stay duration チャートが描画される", async ({ page }) => {
		await expect(
			page.getByRole("heading", {
				name: "Stay duration summary",
				level: 2,
			})
		).toBeVisible();
	});
});
