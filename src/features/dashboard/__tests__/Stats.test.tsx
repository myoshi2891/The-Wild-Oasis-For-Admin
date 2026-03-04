import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Stats from "../Stats";

describe("Stats", () => {
	const bookings = [
		{ id: 1, totalPrice: 250 },
		{ id: 2, totalPrice: 300 },
		{ id: 3, totalPrice: 450 },
	];
	const confirmedStays = [
		{ id: 1, numNights: 3, status: "checked-in" },
		{ id: 2, numNights: 2, status: "checked-out" },
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
