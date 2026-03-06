import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";

const mockCheckout = vi.fn();
const mockDeleteBooking = vi.fn();

vi.mock("../../check-in-out/useCheckout", () => ({
	useCheckout: () => ({ checkout: mockCheckout, isCheckingOut: false }),
}));

vi.mock("../useDeleteBooking", () => ({
	useDeleteBooking: () => ({
		deleteBooking: mockDeleteBooking,
		isDeleting: false,
	}),
}));

import BookingRow from "../BookingRow";
import Table from "../../../ui/Table";
import Menus from "../../../ui/Menus";
import type { BookingWithSummary } from "../../../types/domain";

function renderBookingRow(status = "unconfirmed") {
	const booking = {
		id: 1,
		startDate: "2025-02-01T00:00:00Z",
		endDate: "2025-02-04T00:00:00Z",
		numNights: 3,
		totalPrice: 840,
		status,
		guests: { fullName: "John Doe", email: "john@example.com" },
		cabins: { name: "Cabin 001" },
	} as unknown as BookingWithSummary;

	return renderWithProviders(
		<Menus>
			<Table columns="0.6fr 2fr 2.4fr 1.4fr 1fr 3.2rem">
				<Table.Body
					data={[booking]}
					render={(b) => <BookingRow key={b.id} booking={b} />}
				/>
			</Table>
		</Menus>
	);
}

describe("BookingRow", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("行データを表示する", () => {
		renderBookingRow();

		expect(screen.getByText("Cabin 001")).toBeInTheDocument();
		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("john@example.com")).toBeInTheDocument();
	});

	it("unconfirmed 時にステータスタグを表示する", () => {
		renderBookingRow("unconfirmed");
		expect(screen.getByText("unconfirmed")).toBeInTheDocument();
	});

	it("checked-in 時にステータスタグを表示する", () => {
		renderBookingRow("checked-in");
		expect(screen.getByText("checked in")).toBeInTheDocument();
	});

	it("checked-out 時にステータスタグを表示する", () => {
		renderBookingRow("checked-out");
		expect(screen.getByText("checked out")).toBeInTheDocument();
	});
});
