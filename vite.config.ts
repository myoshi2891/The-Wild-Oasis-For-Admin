import { defineConfig } from "vitest/config";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint2";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), eslint()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/test/setup.ts",
		css: true,
		exclude: [...configDefaults.exclude, "e2e/**/*.spec.ts"],
	},
});
