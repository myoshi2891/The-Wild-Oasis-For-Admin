import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/testUtils";

const mockCreateCabin = vi.fn();
const mockEditCabin = vi.fn();

vi.mock("../useCreateCabin", () => ({
	useCreateCabin: () => ({
		createCabin: mockCreateCabin,
		isCreating: false,
	}),
}));

vi.mock("../useEditCabin", () => ({
	useEditCabin: () => ({
		editCabin: mockEditCabin,
		isEditing: false,
	}),
}));

import CreateCabinForm from "../CreateCabinForm";

describe("CreateCabinForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("新規モードで 'Create new cabin' ボタンを表示する", () => {
		renderWithProviders(<CreateCabinForm />);

		expect(
			screen.getByRole("button", { name: /create new cabin/i })
		).toBeInTheDocument();
		expect(screen.getByLabelText(/cabin name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/maximum capacity/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/regular price/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/^discount$/i)).toBeInTheDocument();
		expect(
			screen.getByLabelText(/description for website/i)
		).toBeInTheDocument();
	});

	it("編集モードで 'Edit cabin' ボタンとプリフィル値を表示する", () => {
		const cabin = {
			id: 1,
			name: "Cabin 001",
			maxCapacity: 4,
			regularPrice: 250,
			discount: 50,
			description: "A nice cabin",
			image: "cabin.jpg",
			created_at: "2025-01-01",
		};

		renderWithProviders(<CreateCabinForm cabinToEdit={cabin} />);

		expect(
			screen.getByRole("button", { name: /edit cabin/i })
		).toBeInTheDocument();
		expect(screen.getByLabelText(/cabin name/i)).toHaveValue("Cabin 001");
	});

	it("空欄送信で必須エラーを表示する", async () => {
		const user = userEvent.setup();
		renderWithProviders(<CreateCabinForm />);

		await user.click(
			screen.getByRole("button", { name: /create new cabin/i })
		);

		await waitFor(() => {
			expect(
				screen.getAllByText("This field is required").length
			).toBeGreaterThanOrEqual(1);
		});

		expect(mockCreateCabin).not.toHaveBeenCalled();
	});
});
