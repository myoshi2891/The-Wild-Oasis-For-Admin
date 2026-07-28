import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Pagination from "../Pagination";

function renderPagination(count: number, initialEntries: string[] = ["/"]) {
	return render(
		<MemoryRouter initialEntries={initialEntries}>
			<Pagination count={count} />
		</MemoryRouter>
	);
}

describe("Pagination", () => {
	it("1ページ以下の場合は null を返す（何も描画しない）", () => {
		const { container } = renderPagination(5); // PAGE_SIZE = 10
		expect(container.innerHTML).toBe("");
	});

	it("複数ページの場合に表示範囲テキストを描画する", () => {
		renderPagination(25);
		expect(screen.getByText(/Showing/)).toBeInTheDocument();
		expect(screen.getByText("1")).toBeInTheDocument();
		expect(screen.getByText("10")).toBeInTheDocument();
		expect(screen.getByText("25")).toBeInTheDocument();
	});

	it("最初のページで Previous ボタンが disabled", () => {
		renderPagination(25);
		expect(
			screen.getByRole("button", { name: /previous/i })
		).toBeDisabled();
	});

	it("最後のページで Next ボタンが disabled", () => {
		renderPagination(25, ["/?page=3"]);
		expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
	});

	it("Next ボタンをクリックするとページが進む", async () => {
		const user = userEvent.setup();
		renderPagination(25);

		await user.click(screen.getByRole("button", { name: /next/i }));

		// After clicking Next, should show page 2 range (11-20)
		expect(screen.getByText("11")).toBeInTheDocument();
		expect(screen.getByText("20")).toBeInTheDocument();
	});

	it("Previous ボタンをクリックするとページが戻る", async () => {
		const user = userEvent.setup();
		renderPagination(25, ["/?page=2"]);

		await user.click(screen.getByRole("button", { name: /previous/i }));

		// After clicking Previous, should show page 1 range (1-10)
		expect(screen.getByText("1")).toBeInTheDocument();
		expect(screen.getByText("10")).toBeInTheDocument();
	});
});
