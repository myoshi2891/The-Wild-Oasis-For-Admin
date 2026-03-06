import { PAGE_SIZE } from "../utils/constants";
import { getToday } from "../utils/helpers";
import supabase from "./supabase";
import type { Filter, SortBy } from "../types/common";
import type {
	Booking,
	BookingAfterDate,
	BookingUpdate,
	BookingWithDetails,
	BookingWithGuestInfo,
	BookingWithSummary,
	StayAfterDate,
} from "../types/domain";

interface GetBookingsParams {
	filter: Filter | null;
	sortBy: SortBy;
	page: number;
}

interface GetBookingsResult {
	data: BookingWithSummary[];
	count: number;
}

/**
 * Fetches a paginated list of bookings with summary fields, applying optional filtering and sorting.
 *
 * @param filter - Optional filter; `method` defaults to `"eq"`. Supported methods: `"gte"`, `"lte"`, `"neq"`, `"eq"`. Filter applies to the specified `field` and `value`.
 * @param sortBy - Optional sort descriptor with `field` and `direction` (`"asc"` or `"desc"`); when provided results are ordered by that field.
 * @param page - 1-based page number; invalid values default to `1`. Results are paginated using the module's `PAGE_SIZE`.
 * @returns An object with `data` (array of booking summaries) and `count` (total number of matching rows).
 */
export async function getBookings({
	filter,
	sortBy,
	page,
}: GetBookingsParams): Promise<GetBookingsResult> {
	let query = supabase
		.from("bookings")
		.select(
			"id, created_at, startDate, endDate, numNights, numGuests, status, totalPrice, cabins(name), guests(fullName, email)",
			{ count: "exact" }
		);

	if (filter) {
		const method = filter.method || "eq";
		switch (method) {
			case "gte":
				query = query.gte(filter.field, filter.value);
				break;
			case "lte":
				query = query.lte(filter.field, filter.value);
				break;
			case "neq":
				query = query.neq(filter.field, filter.value);
				break;
			default:
				query = query.eq(filter.field, filter.value);
				break;
		}
	}

	const safePage =
		typeof page === "number" && Number.isInteger(page) && page >= 1 ? page : 1;
	const from = (safePage - 1) * PAGE_SIZE;
	const to = from + PAGE_SIZE - 1;
	query = query.range(from, to);

	if (sortBy)
		query = query.order(sortBy.field, {
			ascending: sortBy.direction === "asc",
		});

	const { data, error, count } = await query;

	if (error) {
		console.error(error);
		throw new Error("Bookings could not be loaded");
	}
	return { data: data as unknown as BookingWithSummary[], count: count ?? 0 };
}

/**
 * Fetches a booking by ID including cabin and guest details.
 *
 * @param id - The booking's numeric identifier
 * @returns The booking with full details, including cabins and guests
 * @throws Error when no booking with the given id is found
 */
export async function getBooking(id: number): Promise<BookingWithDetails> {
	const { data, error } = await supabase
		.from("bookings")
		.select("*, cabins(*), guests(*)")
		.eq("id", id)
		.single();

	if (error) {
		console.error(error);
		throw new Error("Booking not found");
	}

	return data as unknown as BookingWithDetails;
}

/**
 * Fetches bookings created on or after the given date up through the end of today.
 *
 * @param date - The lower bound for `created_at` (inclusive), e.g., an ISO date string.
 * @returns An array of records containing `created_at`, `totalPrice`, and `extrasPrice` for each matching booking.
 */
export async function getBookingsAfterDate(
	date: string
): Promise<BookingAfterDate[]> {
	const { data, error } = await supabase
		.from("bookings")
		.select("created_at, totalPrice, extrasPrice")
		.gte("created_at", date)
		.lte("created_at", getToday({ end: true }));

	if (error) {
		console.error(error);
		throw new Error("Bookings could not get loaded");
	}

	return data as BookingAfterDate[];
}

/**
 * Fetches stays whose start date is on or after the specified date and up through today.
 *
 * @param date - The lower-bound start date (ISO date string) used to filter stays
 * @returns An array of `StayAfterDate` objects matching the date range
 */
export async function getStaysAfterDate(
	date: string
): Promise<StayAfterDate[]> {
	const { data, error } = await supabase
		.from("bookings")
		.select("*, guests(fullName)")
		.gte("startDate", date)
		.lte("startDate", getToday({ end: false }));

	if (error) {
		console.error(error);
		throw new Error("Bookings could not get loaded");
	}

	return data as unknown as StayAfterDate[];
}

/**
 * Fetches bookings that have activity today (a check-in or a check-out) and includes guest information.
 *
 * @returns An array of bookings occurring today with each booking including guest `fullName`, `nationality`, and `countryFlag`
 */
export async function getStaysTodayActivity(): Promise<
	BookingWithGuestInfo[]
> {
	const { data, error } = await supabase
		.from("bookings")
		.select("*, guests(fullName, nationality, countryFlag)")
		.or(
			`and(status.eq.unconfirmed,startDate.eq.${getToday({ end: false })}),and(status.eq.checked-in,endDate.eq.${getToday({ end: false })})`
		)
		.order("created_at");

	if (error) {
		console.error(error);
		throw new Error("Bookings could not get loaded");
	}
	return data as unknown as BookingWithGuestInfo[];
}

/**
 * Update a booking by ID with the provided fields and return the updated booking.
 *
 * @param id - The numeric ID of the booking to update
 * @param obj - Fields to update on the booking (conforms to `BookingUpdate`)
 * @returns The updated booking record
 * @throws Error if the update operation fails
 */
export async function updateBooking(
	id: number,
	obj: BookingUpdate
): Promise<Booking> {
	const { data, error } = await supabase
		.from("bookings")
		.update(obj)
		.eq("id", id)
		.select()
		.single();

	if (error) {
		console.error(error);
		throw new Error("Booking could not be updated");
	}
	return data as Booking;
}

/**
 * Delete the booking with the given id.
 *
 * @returns `null` on success.
 * @throws Error when the booking could not be deleted
 */
export async function deleteBooking(id: number): Promise<null> {
	// REMEMBER RLS POLICIES
	const { data, error } = await supabase
		.from("bookings")
		.delete()
		.eq("id", id);

	if (error) {
		console.error(error);
		throw new Error("Booking could not be deleted");
	}
	return data;
}
