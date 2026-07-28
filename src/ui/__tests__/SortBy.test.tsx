import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useSearchParams } from "react-router";
import SortBy from "../SortBy";

/** MemoryRouter 内の URL パラメータを可視化するヘルパー */
function SearchParamsDisplay() {
	const [searchParams] = useSearchParams();
	return (
		<div data-testid="search-params">{searchParams.toString()}</div>
	);
}

function renderSortBy(initialEntries: string[] = ["/"]) {
	const options = [
		{ value: "startDate-desc", label: "Sort by date (recent first)" },
		{ value: "startDate-asc", label: "Sort by date (earlier first)" },
		{ value: "totalPrice-desc", label: "Sort by amount (high first)" },
	];

	return render(
		<MemoryRouter initialEntries={initialEntries}>
			<SortBy options={options} />
			<SearchParamsDisplay />
		</MemoryRouter>
	);
}

describe("SortBy", () => {
	it("Select コンポーネントをオプション付きで描画する", () => {
		renderSortBy();
		expect(screen.getByRole("combobox")).toBeInTheDocument();
		expect(screen.getAllByRole("option")).toHaveLength(3);
	});

	it("URL パラメータの sortBy 値を反映する", () => {
		renderSortBy(["/?sortBy=totalPrice-desc"]);
		expect(screen.getByRole("combobox")).toHaveValue("totalPrice-desc");
	});

	it("選択変更で URL パラメータが更新される", async () => {
		const user = userEvent.setup();
		renderSortBy();

		await user.selectOptions(
			screen.getByRole("combobox"),
			"startDate-asc"
		);

		// UI 状態の検証
		expect(screen.getByRole("combobox")).toHaveValue("startDate-asc");

		// URL パラメータが実際に更新されていること
		expect(screen.getByTestId("search-params").textContent).toContain(
			"sortBy=startDate-asc"
		);
	});
});
