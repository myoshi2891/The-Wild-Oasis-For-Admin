import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";

const mockDeleteCabin = vi.fn();
const mockCreateCabin = vi.fn();

vi.mock("../useDeleteCabin", () => ({
	useDeleteCabin: () => ({
		deleteCabin: mockDeleteCabin,
		isDeleting: false,
	}),
}));

vi.mock("../useCreateCabin", () => ({
	useCreateCabin: () => ({
		createCabin: mockCreateCabin,
		isCreating: false,
	}),
}));

import CabinRow from "../CabinRow";
import Table from "../../../ui/Table";
import Menus from "../../../ui/Menus";

const mockCabin = {
	id: 1,
	name: "Cabin 001",
	maxCapacity: 4,
	regularPrice: 250,
	discount: 50,
	description: "A cozy cabin",
	image: "cabin-001.jpg",
	created_at: "2025-01-01",
};

function renderCabinRow(cabin = mockCabin) {
	return renderWithProviders(
		<Menus>
			<Table columns="0.6fr 1.8fr 2.2fr 1fr 1fr 1fr">
				<Table.Body
					data={[cabin]}
					render={(c) => <CabinRow key={c.id} cabin={c} />}
				/>
			</Table>
		</Menus>
	);
}

describe("CabinRow", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("キャビンの基本情報を表示する", () => {
		renderCabinRow();

		expect(screen.getByText("Cabin 001")).toBeInTheDocument();
		expect(screen.getByText(/first up to 4 guests/i)).toBeInTheDocument();
		expect(screen.getByText("$250.00")).toBeInTheDocument();
	});

	it("割引がある場合に割引額を表示する", () => {
		renderCabinRow();
		expect(screen.getByText("$50.00")).toBeInTheDocument();
	});

	it("割引が 0 の場合にダッシュを表示する", () => {
		const noDiscount = { ...mockCabin, discount: 0 };
		renderCabinRow(noDiscount);
		expect(screen.getByText("—")).toBeInTheDocument();
	});
});
