import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDelete from "../ConfirmDelete";

describe("ConfirmDelete", () => {
	it("リソース名を含む確認メッセージを表示する", () => {
		render(
			<ConfirmDelete resourceName="cabin" onConfirm={() => {}} />
		);
		expect(screen.getByText("Delete cabin")).toBeInTheDocument();
		expect(
			screen.getByText(/Are you sure you want to delete this cabin/)
		).toBeInTheDocument();
	});

	it("Delete ボタンをクリックすると onConfirm が呼ばれる", async () => {
		const onConfirm = vi.fn();
		const user = userEvent.setup();

		render(<ConfirmDelete resourceName="cabin" onConfirm={onConfirm} />);

		await user.click(screen.getByRole("button", { name: /delete/i }));
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("Cancel ボタンをクリックすると onCloseModal が呼ばれる", async () => {
		const onCloseModal = vi.fn();
		const user = userEvent.setup();

		render(
			<ConfirmDelete
				resourceName="cabin"
				onConfirm={() => {}}
				onCloseModal={onCloseModal}
			/>
		);

		await user.click(screen.getByRole("button", { name: /cancel/i }));
		expect(onCloseModal).toHaveBeenCalledTimes(1);
	});

	it("disabled 時にボタンが無効化される", () => {
		render(
			<ConfirmDelete resourceName="cabin" onConfirm={() => {}} disabled />
		);
		expect(screen.getByRole("button", { name: /delete/i })).toBeDisabled();
		expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
	});
});
