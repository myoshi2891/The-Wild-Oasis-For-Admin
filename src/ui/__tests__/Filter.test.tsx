import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Filter from "../Filter";

function renderFilter(initialEntries: string[] = ["/"]) {
	const options = [
		{ value: "all", label: "All" },
		{ value: "checked-in", label: "Checked in" },
		{ value: "checked-out", label: "Checked out" },
	];

	return render(
		<MemoryRouter initialEntries={initialEntries}>
			<Filter filterField="status" options={options} />
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

		// After click, 'Checked in' should be the active (disabled) button
		expect(
			screen.getByRole("button", { name: "Checked in" })
		).toBeDisabled();
		expect(screen.getByRole("button", { name: "All" })).toBeEnabled();
	});
});
