import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SortBy from "../SortBy";

function renderSortBy(initialEntries: string[] = ["/"]) {
	const options = [
		{ value: "startDate-desc", label: "Sort by date (recent first)" },
		{ value: "startDate-asc", label: "Sort by date (earlier first)" },
		{ value: "totalPrice-desc", label: "Sort by amount (high first)" },
	];

	return render(
		<MemoryRouter initialEntries={initialEntries}>
			<SortBy options={options} />
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

		expect(screen.getByRole("combobox")).toHaveValue("startDate-asc");
	});
});
