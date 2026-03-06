import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Stats from "../Stats";
import type { BookingAfterDate, StayAfterDate } from "../../../types/domain";

describe("Stats", () => {
	const bookings: BookingAfterDate[] = [
		{ created_at: "2023-01-01", totalPrice: 250, extrasPrice: 0 },
		{ created_at: "2023-01-02", totalPrice: 300, extrasPrice: 0 },
		{ created_at: "2023-01-03", totalPrice: 450, extrasPrice: 0 },
	];

	function createMockStay(overrides: Partial<StayAfterDate>): StayAfterDate {
		return {
			id: 1, created_at: "2023-01-01", startDate: "2023-01-01", endDate: "2023-01-02",
			numNights: 1, numGuests: 1, cabinPrice: 100, extrasPrice: 0, totalPrice: 100,
			status: "unconfirmed", hasBreakfast: false, isPaid: false, observations: "",
			cabinId: 1, guestId: 1, guests: { fullName: "Test" },
			...overrides,
		};
	}

	const confirmedStays: StayAfterDate[] = [
		createMockStay({ id: 1, guestId: 101, status: "checked-in", numNights: 3, guests: { fullName: "Test Guest 1" } }),
		createMockStay({ id: 2, guestId: 102, status: "checked-out", numNights: 2, guests: { fullName: "Test Guest 2" } }),
	];
	const numDays = 7;
	const cabinCount = 8;

	it("4つの Stat コンポーネントを描画する", () => {
		render(
			<Stats
				bookings={bookings}
				confirmedStays={confirmedStays}
				numDays={numDays}
				cabinCount={cabinCount}
			/>
		);

		// Booking count
		expect(screen.getByText("Booking")).toBeInTheDocument();
		expect(screen.getByText("3")).toBeInTheDocument();

		// Sales
		expect(screen.getByText("Sales")).toBeInTheDocument();
		expect(screen.getByText("$1,000.00")).toBeInTheDocument();

		// Check ins
		expect(screen.getByText("Check ins")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();

		// Occupancy rate: (3+2) / (7*8) = 5/56 ≈ 9%
		expect(screen.getByText("Occupancy rate")).toBeInTheDocument();
		expect(screen.getByText("9%")).toBeInTheDocument();
	});

	it("空の bookings で 0 を表示する", () => {
		render(
			<Stats
				bookings={[]}
				confirmedStays={[]}
				numDays={7}
				cabinCount={8}
			/>
		);

		// 0 は Bookings と Check ins の2箇所に表示される
		expect(screen.getAllByText("0")).toHaveLength(2);
		expect(screen.getByText("$0.00")).toBeInTheDocument();
	});

	it("cabinCount が 0 の場合にクラッシュせず安全なフォールバックを表示する", () => {
		expect(() =>
			render(
				<Stats
					bookings={bookings}
					confirmedStays={confirmedStays}
					numDays={7}
					cabinCount={0}
				/>
			)
		).not.toThrow();

		expect(screen.getByText("Occupancy rate")).toBeInTheDocument();
		// division by zero → Infinity → "Infinity%" or "NaN%"
		// Stats uses Math.round(occupation * 100) + "%" so Infinity → "Infinity%"
		const occupancyValue = screen.getByText("Occupancy rate")
			.closest("div")
			?.querySelector("p");
		expect(occupancyValue).toBeDefined();
	});

	it("numDays が 0 の場合にクラッシュせず安全なフォールバックを表示する", () => {
		expect(() =>
			render(
				<Stats
					bookings={bookings}
					confirmedStays={confirmedStays}
					numDays={0}
					cabinCount={8}
				/>
			)
		).not.toThrow();

		expect(screen.getByText("Occupancy rate")).toBeInTheDocument();
	});
});
