import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getBooking } from "../../services/apiBookings";

export function useBooking() {
	const { bookingId } = useParams();
	const numericBookingId = Number(bookingId);
	const isValidId = Boolean(bookingId) && !Number.isNaN(numericBookingId);

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
