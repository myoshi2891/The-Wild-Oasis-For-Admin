import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { useSearchParams } from "react-router";
import { getBookingsAfterDate } from "../../services/apiBookings";
import { parsePositiveDaysParam } from "../../utils/helpers";

/**
 * Fetches bookings from the past N days based on the URL `last` search parameter.
 *
 * Parses the `last` search parameter as an integer >= 1; if absent or invalid, uses 7 days.
 * Computes the cutoff date as N days before today and returns the React Query loading state and fetched bookings for that period.
 *
 * @returns An object with `isLoading` indicating whether the query is in progress, and `bookings` containing the fetched bookings array or `undefined` if not yet available.
 */
export function useRecentBookings() {
	const [searchParams] = useSearchParams();

	const numDays = parsePositiveDaysParam(searchParams.get("last"), 7);

	const queryDate = subDays(new Date(), numDays).toISOString();

	const { isLoading, data: bookings } = useQuery({
		queryFn: () => getBookingsAfterDate(queryDate),
		queryKey: ["bookings", `last-${numDays}`],
	});

	return { isLoading, bookings };
}
