import { test, expect } from "@playwright/test";

test.describe("認証フロー（未認証）", () => {
	// このブロックは storageState なしで実行（ログインなし）
	test.use({ storageState: { cookies: [], origins: [] } });

	test("ログインページが表示される", async ({ page }) => {
		await page.goto("/login");

		await expect(
			page.getByRole("heading", { name: /log in to your account/i })
		).toBeVisible();
		await expect(page.locator("#email")).toBeVisible();
		await expect(page.locator("#password")).toBeVisible();
		await expect(
			page.getByRole("button", { name: /login/i })
		).toBeVisible();
	});

	test("正しい認証情報でログイン→ダッシュボードへ遷移", async ({ page }) => {
		await page.goto("/login");

		await page.locator("#email").fill(process.env.E2E_USER_EMAIL!);
		await page.locator("#password").fill(process.env.E2E_USER_PASSWORD!);
		await page.getByRole("button", { name: /login/i }).click();

		await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 });
	});

	test("無効な認証情報でエラーメッセージが表示される", async ({ page }) => {
		await page.goto("/login");

		await page.locator("#email").fill("wrong@example.com");
		await page.locator("#password").fill("wrongpassword");
		await page.getByRole("button", { name: /login/i }).click();

		// エラートーストが表示される
		await expect(
			page.getByText("Provided email and password are incorrect")
		).toBeVisible({ timeout: 10_000 });
	});

	test("未認証ユーザーが保護ルートにアクセスすると /login にリダイレクト", async ({
		page,
	}) => {
		await page.goto("/dashboard");

		// /login にリダイレクトされる
		await expect(page).toHaveURL(/login/, { timeout: 15_000 });
	});
});

// ── 認証済みテスト（storageState 使用） ──
test.describe("認証済みユーザー", () => {
	test.use({ storageState: "e2e/.auth/user.json" });

	test("ログアウトで /login に遷移", async ({ page }) => {
		await page.goto("/dashboard");
		await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 });

		// HeaderMenu 内のログアウトボタン（最後の button）をクリック
		const header = page.locator("header");
		const logoutButton = header.locator("button").last();
		await logoutButton.click();

		// /login にリダイレクトされる
		await expect(page).toHaveURL(/login/, { timeout: 15_000 });
	});
});
