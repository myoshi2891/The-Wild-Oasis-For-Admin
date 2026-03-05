import { test, expect } from "./fixtures";

test.describe("予約管理", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/bookings");
		// テーブルが完全にロードされるまで待機
		await expect(page.locator("[role='row']").first()).toBeVisible({
			timeout: 15_000,
		});
	});

	test("予約一覧テーブルが表示される", async ({ page }) => {
		// 少なくとも1件の予約行が存在する（ヘッダー行 + データ行）
		const rows = page.locator("[role='row']");
		await expect(rows).not.toHaveCount(0);
	});

	test("ステータスフィルターが動作する", async ({ page }) => {
		// "Checked out" フィルタークリック
		await page.getByRole("button", { name: "Checked out" }).click();
		await expect(page).toHaveURL(/status=checked-out/);

		// "Unconfirmed" フィルタークリック
		await page.getByRole("button", { name: "Unconfirmed" }).click();
		await expect(page).toHaveURL(/status=unconfirmed/);

		// "All" に戻す
		await page.getByRole("button", { name: "All" }).click();
		await expect(page).toHaveURL(/status=all/);
	});

	test("ソートが動作する", async ({ page }) => {
		const sortSelect = page.locator("select");
		await sortSelect.selectOption("totalPrice-desc");
		await expect(page).toHaveURL(/sortBy=totalPrice-desc/);
	});

	test("予約詳細ページに遷移できる", async ({ page }) => {
		// 最初のデータ行の "See details" をクリック
		const firstRow = page.locator("[role='row']").nth(1);
		await firstRow.getByRole("button").click();
		await page.getByRole("button", { name: /see details/i }).click();

		// /bookings/:id に遷移
		await expect(page).toHaveURL(/bookings\/\d+/, { timeout: 10_000 });

		// 詳細ヘッダーが表示される
		await expect(
			page.getByRole("heading", { name: /Booking #/ })
		).toBeVisible({ timeout: 10_000 });
	});
});
