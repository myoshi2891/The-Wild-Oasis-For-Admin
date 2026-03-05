import { test as base, type Page } from "@playwright/test";

/**
 * 認証済みページを提供するカスタムフィクスチャ。
 * storageState は playwright.config.ts のプロジェクト設定で注入済み。
 */
export const test = base.extend<{
	/** 認証済み状態 (storageState が注入された) のページ（ダッシュボード等への自動遷移は行わない） */
	authenticatedPage: Page;
}>({
	authenticatedPage: async ({ page }, use) => {
		// storageState が注入されているので既にログイン済み
		await use(page);
	},
});

export { expect } from "@playwright/test";
