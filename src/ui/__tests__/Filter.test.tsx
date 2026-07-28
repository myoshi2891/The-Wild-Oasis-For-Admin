import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useSearchParams } from "react-router";
import Filter from "../Filter";

/** MemoryRouter 内の URL パラメータを可視化するヘルパー */
function SearchParamsDisplay() {
	const [searchParams] = useSearchParams();
	return (
		<div data-testid="search-params">{searchParams.toString()}</div>
	);
}

function renderFilter(initialEntries: string[] = ["/"]) {
	const options = [
		{ value: "all", label: "All" },
		{ value: "checked-in", label: "Checked in" },
		{ value: "checked-out", label: "Checked out" },
	];

	return render(
		<MemoryRouter initialEntries={initialEntries}>
			<Filter filterField="status" options={options} />
			<SearchParamsDisplay />
		</MemoryRouter>
	);
}

describe("Filter", () => {
	it("すべてのオプションをボタンとして描画する", () => {
		renderFilter();
		expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Checked in" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Checked out" })
		).toBeInTheDocument();
	});

	it("デフォルトで最初のオプションがアクティブ（disabled）になる", () => {
		renderFilter();
		expect(screen.getByRole("button", { name: "All" })).toBeDisabled();
	});

	it("URL パラメータの値に一致するボタンがアクティブになる", () => {
		renderFilter(["/?status=checked-in"]);
		expect(
			screen.getByRole("button", { name: "Checked in" })
		).toBeDisabled();
		expect(screen.getByRole("button", { name: "All" })).toBeEnabled();
	});

	it("ボタンクリックで URL パラメータが更新される", async () => {
		const user = userEvent.setup();
		renderFilter();

		await user.click(screen.getByRole("button", { name: "Checked in" }));

		// ボタンの状態が切り替わること
		expect(
			screen.getByRole("button", { name: "Checked in" })
		).toBeDisabled();
		expect(screen.getByRole("button", { name: "All" })).toBeEnabled();

		// URL パラメータが実際に更新されていること
		expect(screen.getByTestId("search-params").textContent).toContain(
			"status=checked-in"
		);
	});
});
