import "@testing-library/jest-dom/vitest";

// matchMedia polyfill for jsdom (styled-components / DarkMode tests)
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	}),
});

// ResizeObserver polyfill for jsdom (Recharts ResponsiveContainer)
global.ResizeObserver = class {
	observe() {}
	unobserve() {}
	disconnect() {}
};
