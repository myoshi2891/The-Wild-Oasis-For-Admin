import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { getBookingsAfterDate } from "../../services/apiBookings";

export function useRecentBookings() {
	const [searchParams] = useSearchParams();

	const lastParam = searchParams.get("last");
	const parsed = lastParam ? Number(lastParam) : 7;
	const numDays = Number.isFinite(parsed) && Number.isInteger(parsed) && parsed >= 1 ? parsed : 7;

	const queryDate = subDays(new Date(), numDays).toISOString();

	const { isLoading, data: bookings } = useQuery({
		queryFn: () => getBookingsAfterDate(queryDate),
		queryKey: ["bookings", `last-${numDays}`],
	});

	return { isLoading, bookings };
}
