import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Checkbox from "../Checkbox";

describe("Checkbox", () => {
	it("チェックボックスとラベルを描画する", () => {
		render(
			<Checkbox checked={false} onChange={() => {}} id="test">
				Test Label
			</Checkbox>
		);
		expect(screen.getByRole("checkbox")).toBeInTheDocument();
		expect(screen.getByText("Test Label")).toBeInTheDocument();
	});

	it("checked 状態を正しく反映する", () => {
		render(
			<Checkbox checked={true} onChange={() => {}} id="test">
				Label
			</Checkbox>
		);
		expect(screen.getByRole("checkbox")).toBeChecked();
	});

	it("クリックで onChange コールバックが呼ばれる", async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();

		render(
			<Checkbox checked={false} onChange={handleChange} id="test">
				Label
			</Checkbox>
		);

		await user.click(screen.getByRole("checkbox"));
		expect(handleChange).toHaveBeenCalledTimes(1);
	});

	it("disabled 時にクリックしても onChange は呼ばれない", async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();

		render(
			<Checkbox checked={false} onChange={handleChange} id="test" disabled>
				Label
			</Checkbox>
		);

		await user.click(screen.getByRole("checkbox"));
		expect(handleChange).not.toHaveBeenCalled();
	});
});
