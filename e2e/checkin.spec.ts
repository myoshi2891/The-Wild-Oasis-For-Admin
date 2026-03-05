import { test, expect } from "./fixtures";

test.describe("チェックイン / チェックアウト", () => {
	test("チェックインページが表示される", async ({ page }) => {
		// unconfirmed な予約を見つけてチェックインページへ遷移
		await page.goto("/bookings");
		await expect(page.locator("[role='row']").first()).toBeVisible({
			timeout: 15_000,
		});

		// "Unconfirmed" フィルターで絞り込み
		await page.getByRole("button", { name: "Unconfirmed" }).click();

		// 最初の unconfirmed 予約を開く
		const firstRow = page.locator("[role='row']").nth(1);
		await firstRow.getByRole("button").click();
		await page.getByRole("button", { name: /check in/i }).click();

		// チェックインページの見出しが表示される
		await expect(
			page.getByRole("heading", { name: /Check in booking #/ })
		).toBeVisible({ timeout: 10_000 });
	});

	test("支払い確認チェックボックスで Check in ボタンが有効化される", async ({
		page,
	}) => {
		// unconfirmed な予約のチェックインページへ直接遷移
		await page.goto("/bookings");
		await expect(page.locator("[role='row']").first()).toBeVisible({
			timeout: 15_000,
		});
		await page.getByRole("button", { name: "Unconfirmed" }).click();

		const firstRow = page.locator("[role='row']").nth(1);
		await firstRow.getByRole("button").click();
		await page.getByRole("button", { name: /check in/i }).click();

		await expect(
			page.getByRole("heading", { name: /Check in booking #/ })
		).toBeVisible({ timeout: 10_000 });

		// Check in ボタンが disabled
		const checkinBtn = page.getByRole("button", {
			name: /Check in booking/,
		});
		await expect(checkinBtn).toBeDisabled();

		// 支払い確認チェックボックスをクリック
		await page.locator("#confirm").click();

		// Check in ボタンが enabled に
		await expect(checkinBtn).toBeEnabled();
	});
});
