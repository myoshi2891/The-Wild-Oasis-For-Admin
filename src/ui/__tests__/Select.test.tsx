import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Select from "../Select";

describe("Select", () => {
	const options = [
		{ value: "opt1", label: "Option 1" },
		{ value: "opt2", label: "Option 2" },
		{ value: "opt3", label: "Option 3" },
	];

	it("すべてのオプションを描画する", () => {
		render(
			<Select options={options} value="opt1" onChange={() => {}} />
		);
		const selectEl = screen.getByRole("combobox");
		expect(selectEl).toBeInTheDocument();
		expect(screen.getAllByRole("option")).toHaveLength(3);
	});

	it("value に一致するオプションが選択される", () => {
		render(
			<Select options={options} value="opt2" onChange={() => {}} />
		);
		expect(screen.getByRole("combobox")).toHaveValue("opt2");
	});

	it("選択変更で onChange コールバックが呼ばれる", async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();

		render(
			<Select options={options} value="opt1" onChange={handleChange} />
		);

		await user.selectOptions(screen.getByRole("combobox"), "opt3");
		expect(handleChange).toHaveBeenCalledTimes(1);
	});
});
