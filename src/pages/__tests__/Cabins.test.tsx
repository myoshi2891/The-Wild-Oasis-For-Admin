import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Cabins from "../Cabins";

// 子コンポーネントのモック
vi.mock("../../features/cabins/CabinTable", () => ({
	default: () => <div data-testid="cabin-table">CabinTable</div>,
}));
vi.mock("../../features/cabins/AddCabin", () => ({
	default: () => <div data-testid="add-cabin">AddCabin</div>,
}));
vi.mock("../../features/cabins/CabinTableOperations", () => ({
	default: () => (
		<div data-testid="cabin-table-operations">CabinTableOperations</div>
	),
}));

describe("Cabins", () => {
	it("見出し・CabinTableOperations・CabinTable・AddCabin を描画する", () => {
		render(<Cabins />);
		expect(screen.getByText("All cabins")).toBeInTheDocument();
		expect(screen.getByTestId("cabin-table-operations")).toBeInTheDocument();
		expect(screen.getByTestId("cabin-table")).toBeInTheDocument();
		expect(screen.getByTestId("add-cabin")).toBeInTheDocument();
	});
});
