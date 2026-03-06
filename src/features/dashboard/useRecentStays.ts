import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { getStaysAfterDate } from "../../services/apiBookings";

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
