import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBookings } from "../../services/apiBookings";
import { useSearchParams } from "react-router";
import { PAGE_SIZE } from "../../utils/constants";
import type { Filter, SortBy } from "../../types/common";

/**
 * Provides booking list state derived from URL search parameters and prefetches adjacent pages.
 *
 * Builds a `status` filter (null when absent or `"all"`), validates and builds `sortBy` from the `sortBy` param (defaults to `startDate-desc`), derives the current `page` (defaults to 1), queries bookings using those parameters, and prefetches the previous and next pages when available.
 *
 * @returns An object with the current bookings query state:
 * - `isLoading` — whether the query is currently loading
 * - `error` — any error returned by the query
 * - `bookings` — array of booking items (empty array when no data)
 * - `count` — total number of bookings matching the query
 */
export function useBookings() {
	const queryClient = useQueryClient();
	const [searchParams] = useSearchParams();

	const filterValue = searchParams.get("status");
	const filter: Filter | null =
		!filterValue || filterValue === "all"
			? null
			: { field: "status", value: filterValue };

	const sortByRaw = searchParams.get("sortBy") || "startDate-desc";
	const [rawField, rawDirection] = sortByRaw.split("-");
	const allowedFields = [
		"startDate",
		"endDate",
		"created_at",
		"totalPrice",
		"status",
	];
	const field = allowedFields.includes(rawField) ? rawField : "startDate";
	const direction: "asc" | "desc" =
		rawDirection === "asc" || rawDirection === "desc" ? rawDirection : "desc";
	const sortBy: SortBy = { field, direction };

	const page = !searchParams.get("page")
		? 1
		: Number(searchParams.get("page"));

	const {
		isLoading,
		data: { data: bookings, count } = { data: [], count: 0 },
		error,
	} = useQuery({
		queryKey: ["bookings", filter, sortBy, page],
		queryFn: () => getBookings({ filter, sortBy, page }),
	});

	const pageCount = Math.ceil(count / PAGE_SIZE);

	if (page < pageCount)
		queryClient.prefetchQuery({
			queryKey: ["bookings", filter, sortBy, page + 1],
			queryFn: () => getBookings({ filter, sortBy, page: page + 1 }),
		});

	if (page > 1)
		queryClient.prefetchQuery({
			queryKey: ["bookings", filter, sortBy, page - 1],
			queryFn: () => getBookings({ filter, sortBy, page: page - 1 }),
		});
	return { isLoading, error, bookings, count };
}
