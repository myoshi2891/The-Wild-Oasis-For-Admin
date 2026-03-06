import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { getStaysAfterDate } from "../../services/apiBookings";

export function useRecentStays() {
	const [searchParams] = useSearchParams();

	const rawNumDays = !searchParams.get("last")
		? 7
		: Number(searchParams.get("last"));
	const numDays = Math.max(1, rawNumDays);

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
