import { test as base, type Page } from "@playwright/test";

/**
 * 認証済みページを提供するカスタムフィクスチャ。
 * storageState は playwright.config.ts のプロジェクト設定で注入済み。
 */
export const test = base.extend<{
	/** 認証済みでダッシュボードにいる状態のページ */
	authenticatedPage: Page;
}>({
	authenticatedPage: async ({ page }, use) => {
		// storageState が注入されているので既にログイン済み
		await use(page);
	},
});

export { expect } from "@playwright/test";
