import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";

vi.mock("../useCreateCabin", () => ({
	useCreateCabin: () => ({
		createCabin: vi.fn(),
		isCreating: false,
	}),
}));

vi.mock("../useEditCabin", () => ({
	useEditCabin: () => ({
		editCabin: vi.fn(),
		isEditing: false,
	}),
}));

import AddCabin from "../AddCabin";

describe("AddCabin", () => {
	it("'Add new cabin' ボタンを描画する", () => {
		renderWithProviders(<AddCabin />);
		expect(
			screen.getByRole("button", { name: /add new cabin/i })
		).toBeInTheDocument();
	});
});
