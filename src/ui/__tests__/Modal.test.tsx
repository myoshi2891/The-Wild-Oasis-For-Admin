import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "../Modal";

describe("Modal", () => {
	it("Open をクリックすると Window が表示される", async () => {
		const user = userEvent.setup();

		render(
			<Modal>
				<Modal.Open opens="test-modal">
					<button type="button">Open Modal</button>
				</Modal.Open>
				<Modal.Window name="test-modal">
					<div>Modal Content</div>
				</Modal.Window>
			</Modal>
		);

		// Initially, modal content should not be visible
		expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();

		// Click the trigger
		await user.click(screen.getByRole("button", { name: "Open Modal" }));

		// Now modal content should be visible
		expect(screen.getByText("Modal Content")).toBeInTheDocument();
	});

	it("Close ボタンで Window が閉じる", async () => {
		const user = userEvent.setup();

		render(
			<Modal>
				<Modal.Open opens="test-modal">
					<button type="button">Open Modal</button>
				</Modal.Open>
				<Modal.Window name="test-modal">
					<div>Modal Content</div>
				</Modal.Window>
			</Modal>
		);

		await user.click(screen.getByRole("button", { name: "Open Modal" }));
		expect(screen.getByText("Modal Content")).toBeInTheDocument();

		// Click close button
		await user.click(screen.getByRole("button", { name: /close/i }));

		expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();
	});

	it("異なる name の Window は表示されない", async () => {
		const user = userEvent.setup();

		render(
			<Modal>
				<Modal.Open opens="modal-a">
					<button type="button">Open A</button>
				</Modal.Open>
				<Modal.Window name="modal-b">
					<div>Wrong Modal</div>
				</Modal.Window>
			</Modal>
		);

		await user.click(screen.getByRole("button", { name: "Open A" }));
		expect(screen.queryByText("Wrong Modal")).not.toBeInTheDocument();
	});
});
