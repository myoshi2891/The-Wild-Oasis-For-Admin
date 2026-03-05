import { defineConfig, devices } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// ── .env.local から環境変数を読み込む ──
const __dirname = path.dirname(fileURLToPath(import.meta.url));
for (const file of [".env.test", ".env.local", ".env"]) {
	const envPath = path.join(__dirname, file);
	if (fs.existsSync(envPath)) {
		const content = fs.readFileSync(envPath, "utf-8");
		for (const line of content.split("\n")) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const eqIdx = trimmed.indexOf("=");
			if (eqIdx === -1) continue;
			let key = trimmed.slice(0, eqIdx);
			if (key.startsWith("export ")) {
				key = key.slice("export ".length).trim();
			}
			let value = trimmed.slice(eqIdx + 1).trim();
			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.slice(1, -1);
				value = value.replace(/\\(["'])/g, "$1");
			}
			if (!process.env[key]) process.env[key] = value;
		}
	}
}

export default defineConfig({
	testDir: "./e2e",
	testMatch: "**/*.spec.ts",
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: "html",
	timeout: 30_000,

	use: {
		baseURL: "http://localhost:5173",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},

	projects: [
		{
			name: "setup",
			testMatch: /auth\.setup\.ts/,
		},
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				storageState: "e2e/.auth/user.json",
			},
			dependencies: ["setup"],
		},
	],

	webServer: {
		command: "bun run dev",
		url: "http://localhost:5173",
		reuseExistingServer: !process.env.CI,
		timeout: 30_000,
	},
});
