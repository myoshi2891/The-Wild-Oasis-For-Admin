import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBookings } from "../../services/apiBookings";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";
import type { Filter, SortBy } from "../../types/common";

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
		"createdAt",
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
