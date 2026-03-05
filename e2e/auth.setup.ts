import { test as setup, expect } from "@playwright/test";

/**
 * 認証 setup — テスト用アカウントでログインし storageState を保存。
 * 全テストプロジェクトの依存として最初に1度だけ実行。
 */
setup("authenticate", async ({ page }) => {
	const email = process.env.E2E_USER_EMAIL;
	const password = process.env.E2E_USER_PASSWORD;

	if (!email || !password) {
		throw new Error(
			"E2E_USER_EMAIL / E2E_USER_PASSWORD が設定されていません。.env.local に追加してください。"
		);
	}

	await page.goto("/login");

	// ログインフォーム入力
	await page.locator("#email").fill(email);
	await page.locator("#password").fill(password);
	await page.getByRole("button", { name: /login/i }).click();

	// ダッシュボードへの遷移を待機
	await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 });

	// storageState を保存
	await page.context().storageState({ path: "e2e/.auth/user.json" });
});
