import { test, expect } from "./fixtures";

test.describe("客室管理", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/cabins");
		// テーブルが完全にロードされるまで待機
		await expect(
			page.getByText("001", { exact: true })
		).toBeVisible({ timeout: 15_000 });
	});

	test("客室一覧テーブルが表示される", async ({ page }) => {
		// 客室データが表示される（シードデータ: 001〜008）
		await expect(page.getByText("001", { exact: true })).toBeVisible();
		await expect(page.getByText("002", { exact: true })).toBeVisible();
		await expect(page.getByText("008", { exact: true })).toBeVisible();
	});

	test("割引ありフィルターで客室が絞り込まれる", async ({ page }) => {
		// "With discount" フィルタークリック
		await page.getByRole("button", { name: "With discount" }).click();
		await expect(page).toHaveURL(/discount=with-discount/);

		// 割引なしの客室 (001: discount=0) は表示されない
		await expect(
			page.getByText("001", { exact: true })
		).not.toBeVisible({ timeout: 5_000 });
		// 割引ありの客室 (002: discount=25) は表示される
		await expect(page.getByText("002", { exact: true })).toBeVisible();
	});

	test("客室を複製できる", async ({ page }) => {
		// 002 の行のメニュー（3点ボタン）をクリック
		const row = page.locator("[role='row']").filter({
			hasText: /^002/,
		});
		await row.getByRole("button").click();

		// "Duplicate" をクリック
		await page.getByRole("button", { name: /duplicate/i }).click();

		// "Copy of 002" が追加される
		await expect(page.getByText("Copy of 002")).toBeVisible({
			timeout: 10_000,
		});
	});

	test("複製した客室を削除できる", async ({ page }) => {
		// "Copy of 002" の行を探す
		const copyRow = page.locator("[role='row']").filter({
			hasText: "Copy of 002",
		});

		// 存在するか確認
		await expect(copyRow).toBeVisible({ timeout: 10_000 });

		await copyRow.getByRole("button").click();

		// "Delete" をクリック
		await page.getByRole("button", { name: /delete/i }).click();

		// 確認モーダルで "Delete" をクリック
		await page
			.getByRole("button", { name: /delete/i })
			.last()
			.click();

		// 行が消える
		await expect(page.getByText("Copy of 002")).not.toBeVisible({
			timeout: 10_000,
		});
	});
});
