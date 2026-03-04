import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getBooking } from "../../services/apiBookings";

/**
 * Provides booking data and query state for the current route's `bookingId`.
 *
 * Fetches the booking when the route `bookingId` is a positive integer; otherwise no fetch is performed.
 *
 * @returns An object with:
 * - `isLoading` — `true` while the booking is being fetched, `false` otherwise.
 * - `error` — the error returned by the fetch, if any.
 * - `booking` — the fetched booking data, or `undefined` when not available.
 */
export function useBooking() {
	const { bookingId } = useParams();
	const numericBookingId = Number(bookingId);
	const isValidId =
		Boolean(bookingId) &&
		Number.isInteger(numericBookingId) &&
		numericBookingId > 0;

	const {
		isLoading,
		data: booking,
		error,
	} = useQuery({
		queryKey: ["booking", numericBookingId],
		queryFn: () => getBooking(numericBookingId),
		enabled: isValidId,
		retry: false,
	});

	return { isLoading, error, booking };
}
