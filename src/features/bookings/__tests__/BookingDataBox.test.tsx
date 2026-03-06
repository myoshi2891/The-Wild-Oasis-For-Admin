
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BookingDataBox from "../BookingDataBox";
import type { BookingWithDetails } from "../../../types/domain";

const mockBooking: BookingWithDetails = {
	id: 1,
	created_at: "2025-01-15T10:00:00Z",
	startDate: "2025-02-01T00:00:00Z",
	endDate: "2025-02-04T00:00:00Z",
	numNights: 3,
	numGuests: 2,
	cabinPrice: 750,
	extrasPrice: 90,
	totalPrice: 840,
	status: "unconfirmed",
	hasBreakfast: true,
	observations: "Late arrival",
	isPaid: true,
	cabinId: 1,
	guestId: 1,
	guests: {
		id: 1,
		created_at: "2025-01-01T00:00:00Z",
		fullName: "John Doe",
		email: "john@example.com",
		nationality: "United States",
		countryFlag: "https://flagcdn.com/us.svg",
		nationalID: "123456789",
	},
	cabins: {
		id: 1,
		created_at: "2025-01-01T00:00:00Z",
		name: "Cabin 001",
		maxCapacity: 2,
		regularPrice: 250,
		discount: 0,
		description: "A nice cabin",
		image: "https://example.com/cabin.jpg",
	},
};

describe("BookingDataBox", () => {
	it("予約の基本情報を表示する", () => {
		render(<BookingDataBox booking={mockBooking} />);

		expect(screen.getByText(/cabin 001/i)).toBeInTheDocument();
		expect(screen.getByText(/3 nights/i)).toBeInTheDocument();
		expect(screen.getByText(/John Doe/)).toBeInTheDocument();
		expect(screen.getByText("john@example.com")).toBeInTheDocument();
	});

	it("朝食ありの場合 'Yes' を表示する", () => {
		render(<BookingDataBox booking={mockBooking} />);
		expect(screen.getByText("Yes")).toBeInTheDocument();
	});

	it("朝食なしの場合 'No' を表示する", () => {
		const noBreakfast = { ...mockBooking, hasBreakfast: false };
		render(<BookingDataBox booking={noBreakfast} />);
		expect(screen.getByText("No")).toBeInTheDocument();
	});

	it("支払い済みの場合 'Paid' を表示する", () => {
		render(<BookingDataBox booking={mockBooking} />);
		expect(screen.getByText("Paid")).toBeInTheDocument();
	});

	it("未払いの場合 'Will pay at property' を表示する", () => {
		const unpaid = { ...mockBooking, isPaid: false };
		render(<BookingDataBox booking={unpaid} />);
		expect(screen.getByText("Will pay at property")).toBeInTheDocument();
	});

	it("observations がある場合に表示する", () => {
		render(<BookingDataBox booking={mockBooking} />);
		expect(screen.getByText("Late arrival")).toBeInTheDocument();
	});

	it("observations が空の場合は表示しない", () => {
		const noObs = { ...mockBooking, observations: "" };
		render(<BookingDataBox booking={noObs} />);
		expect(screen.queryByText("Late arrival")).not.toBeInTheDocument();
	});
});
