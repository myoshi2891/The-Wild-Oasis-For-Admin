import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { getStaysAfterDate } from "../../services/apiBookings";

/**
 * Fetches stays from the past N days where N is taken from the URL `last` parameter.
 *
 * The `last` parameter is parsed as a positive integer; if missing or invalid, `numDays` defaults to 7.
 *
 * @returns An object with:
 * - `isLoading` - `true` while the fetch is in progress, otherwise `false`.
 * - `stays` - the raw array of stays returned by the query, or `undefined` if not loaded.
 * - `confirmedStays` - the subset of `stays` whose `status` is `"checked-in"` or `"checked-out"`, or `undefined` if `stays` is undefined.
 * - `numDays` - the validated number of days used to compute the query cutoff (always a positive integer).
 */
export function useRecentStays() {
	const [searchParams] = useSearchParams();

	const lastParam = searchParams.get("last");
	const parsed = lastParam ? Number(lastParam) : 7;
	const numDays = Number.isFinite(parsed) && Number.isInteger(parsed) && parsed >= 1 ? parsed : 7;

	const queryDate = subDays(new Date(), numDays).toISOString();

	const { isLoading, data: stays } = useQuery({
		queryFn: () => getStaysAfterDate(queryDate),
		queryKey: ["stays", `last-${numDays}`],
	});

	const confirmedStays = stays?.filter(
		(stay) => stay.status === "checked-in" || stay.status === "checked-out"
	);

	return { isLoading, stays, confirmedStays, numDays };
}
