import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";

const mockCabins = [
	{
		id: 1,
		name: "Cabin A",
		maxCapacity: 4,
		regularPrice: 250,
		discount: 50,
		description: "Discount cabin",
		image: "a.jpg",
		created_at: "2025-01-01",
	},
	{
		id: 2,
		name: "Cabin B",
		maxCapacity: 6,
		regularPrice: 400,
		discount: 0,
		description: "No discount cabin",
		image: "b.jpg",
		created_at: "2025-01-02",
	},
];

vi.mock("../useCabins", () => ({
	useCabins: () => ({ cabins: mockCabins, isLoading: false }),
}));

vi.mock("../useDeleteCabin", () => ({
	useDeleteCabin: () => ({
		deleteCabin: vi.fn(),
		isDeleting: false,
	}),
}));

vi.mock("../useCreateCabin", () => ({
	useCreateCabin: () => ({
		createCabin: vi.fn(),
		isCreating: false,
	}),
}));

import CabinTable from "../CabinTable";

describe("CabinTable", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("テーブルヘッダーを表示する", () => {
		renderWithProviders(<CabinTable />);

		expect(screen.getByText("Cabin")).toBeInTheDocument();
		expect(screen.getByText("Capacity")).toBeInTheDocument();
		expect(screen.getByText("Price")).toBeInTheDocument();
		expect(screen.getByText("Discount")).toBeInTheDocument();
	});

	it("全キャビンを表示する（discount=all）", () => {
		renderWithProviders(<CabinTable />);

		expect(screen.getByText("Cabin A")).toBeInTheDocument();
		expect(screen.getByText("Cabin B")).toBeInTheDocument();
	});

	it("discount=no-discount でフィルタする", () => {
		renderWithProviders(<CabinTable />, {
			routerProps: { initialEntries: ["/?discount=no-discount"] },
		});

		expect(screen.queryByText("Cabin A")).not.toBeInTheDocument();
		expect(screen.getByText("Cabin B")).toBeInTheDocument();
	});

	it("discount=with-discount でフィルタする", () => {
		renderWithProviders(<CabinTable />, {
			routerProps: { initialEntries: ["/?discount=with-discount"] },
		});

		expect(screen.getByText("Cabin A")).toBeInTheDocument();
		expect(screen.queryByText("Cabin B")).not.toBeInTheDocument();
	});
});
