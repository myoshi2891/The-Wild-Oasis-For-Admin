import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBooking } from "../../services/apiBookings";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

interface BreakfastInput {
	hasBreakfast: boolean;
	extrasPrice: number;
	totalPrice: number;
}

interface CheckinParams {
	bookingId: number;
	breakfast?: BreakfastInput;
}

/**
 * Provides a hook to perform a booking check-in and expose the mutation trigger and its loading state.
 *
 * @returns An object with:
 *  - `checkin` — a function accepting `{ bookingId, breakfast? }` to mark the booking as checked in and paid.
 *  - `isCheckingIn` — `true` while the check-in mutation is in progress, `false` otherwise.
 */
export function useCheckin() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { mutate: checkin, isPending: isCheckingIn } = useMutation({
		mutationFn: ({ bookingId, breakfast }: CheckinParams) =>
			updateBooking(bookingId, {
				...breakfast,
				status: "checked-in",
				isPaid: true,
			}),

		onSuccess: (data) => {
			toast.success(`Booking #${data.id} successfully checked in`);
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
			queryClient.invalidateQueries({ queryKey: ["booking", data.id] });
			navigate("/");
		},

		onError: () => toast.error("There was an error while checking in"),
	});

	return { checkin, isCheckingIn };
}
