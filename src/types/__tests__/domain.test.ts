/**
 * 型定義のアサーションテスト
 * satisfies / extends を使って型の整合性を検証
 */

import { describe, it, expect } from "vitest";
import type { Cabin, Booking, Guest, Settings, BookingStatus, BookingWithSummary, BookingWithDetails, CreateCabinFormData } from "../domain";
import type { Filter, SortBy, PaginatedResult } from "../common";

describe("Domain Types", () => {
	it("Cabin 型が正しいフィールドを持つ", () => {
		const cabin = {
			id: 1,
			created_at: "2024-01-01T00:00:00Z",
			name: "Cabin 001",
			maxCapacity: 4,
			regularPrice: 250,
			discount: 50,
			description: "A cozy cabin",
			image: "https://example.com/cabin.jpg",
		} satisfies Cabin;

		expect(cabin.id).toBe(1);
		expect(cabin.name).toBe("Cabin 001");
	});

	it("Booking 型が正しいフィールドとステータスを持つ", () => {
		const booking = {
			id: 1,
			created_at: "2024-01-01T00:00:00Z",
			startDate: "2024-02-01",
			endDate: "2024-02-05",
			numNights: 4,
			numGuests: 2,
			cabinPrice: 1000,
			extrasPrice: 100,
			totalPrice: 1100,
			status: "unconfirmed" as const,
			hasBreakfast: false,
			isPaid: false,
			observations: "",
			cabinId: 1,
			guestId: 1,
		} satisfies Booking;

		expect(booking.status).toBe("unconfirmed");
	});

	it("BookingStatus は3つの定義済みリテラルのみ受け付ける", () => {
		const statuses: BookingStatus[] = ["unconfirmed", "checked-in", "checked-out"];
		expect(statuses).toHaveLength(3);

		// @ts-expect-error 無効なステータスは拒否される
		const _invalid: BookingStatus = "cancelled";
		expect(_invalid).toBeDefined();
	});

	it("Guest 型が正しいフィールドを持つ", () => {
		const guest = {
			id: 1,
			created_at: "2024-01-01T00:00:00Z",
			fullName: "John Doe",
			email: "john@example.com",
			nationality: "US",
			nationalID: "123456789",
			countryFlag: "https://flagcdn.com/us.svg",
		} satisfies Guest;

		expect(guest.fullName).toBe("John Doe");
	});

	it("Settings 型が正しいフィールドを持つ", () => {
		const settings = {
			id: 1,
			created_at: "2024-01-01T00:00:00Z",
			minBookingLength: 3,
			maxBookingLength: 90,
			maxGuestsPerBooking: 8,
			breakfastPrice: 15,
		} satisfies Settings;

		expect(settings.breakfastPrice).toBe(15);
	});

	it("BookingWithSummary 型がリレーションサマリーを含む", () => {
		const booking: BookingWithSummary = {
			id: 1,
			created_at: "2024-01-01T00:00:00Z",
			startDate: "2024-02-01",
			endDate: "2024-02-05",
			numNights: 4,
			numGuests: 2,
			cabinPrice: 1000,
			extrasPrice: 100,
			totalPrice: 1100,
			status: "unconfirmed",
			hasBreakfast: false,
			isPaid: false,
			observations: "",
			cabinId: 1,
			guestId: 1,
			cabins: { name: "Cabin 001" },
			guests: { fullName: "John Doe", email: "john@example.com" },
		};

		expect(booking.cabins.name).toBe("Cabin 001");
		expect(booking.guests.fullName).toBe("John Doe");
	});

	it("CreateCabinFormData が File | FileList | string の image フィールドを持つ", () => {
		// string case
		const withString: CreateCabinFormData = {
			name: "New Cabin",
			maxCapacity: 4,
			regularPrice: 300,
			discount: 0,
			description: "A new cabin",
			image: "https://example.com/image.jpg",
		};
		expect(withString.name).toBe("New Cabin");
		expect(typeof withString.image).toBe("string");

		// File case
		const file = new File(["data"], "cabin.jpg", { type: "image/jpeg" });
		const withFile: CreateCabinFormData = { ...withString, image: file };
		expect(withFile.image).toBeInstanceOf(File);
	});
});

describe("Common Types", () => {
	it("Filter 型が正しい構造を持つ", () => {
		const filter = {
			field: "status",
			value: "checked-in",
		} satisfies Filter;

		expect(filter.field).toBe("status");

		const filterWithMethod = {
			field: "totalPrice",
			value: "500",
			method: "gte" as const,
		} satisfies Filter;

		expect(filterWithMethod.method).toBe("gte");
	});

	it("SortBy 型が asc/desc のみ受け付ける", () => {
		const sortBy = {
			field: "startDate",
			direction: "desc" as const,
		} satisfies SortBy;

		expect(sortBy.direction).toBe("desc");

		// @ts-expect-error 無効な direction は拒否される
		const _invalidSort: SortBy = { field: "x", direction: "up" };
		expect(_invalidSort).toBeDefined();
	});

	it("PaginatedResult がジェネリクスで動作する", () => {
		const result: PaginatedResult<{ id: number }> = {
			data: [{ id: 1 }, { id: 2 }],
			count: 10,
		};

		expect(result.data).toHaveLength(2);
		expect(result.count).toBe(10);
	});
});
