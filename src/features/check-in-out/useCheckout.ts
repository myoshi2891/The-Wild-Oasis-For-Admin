import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBooking } from "../../services/apiBookings";
import toast from "react-hot-toast";

/**
 * Hook that performs a booking "check-out", shows success/error toasts, and invalidates related booking cache.
 *
 * The mutation updates the booking status to "checked-out", displays a success toast containing the booking id
 * or an error toast on failure, and invalidates the `["bookings"]` and `["booking", id]` queries.
 *
 * @returns An object with:
 * - `checkout`: a function accepting a booking id (`number`) to trigger the check-out mutation.
 * - `isCheckingOut`: `true` when the check-out mutation is in progress, `false` otherwise.
 */
export function useCheckout() {
	const queryClient = useQueryClient();
	const { mutate: checkout, isPending: isCheckingOut } = useMutation({
		mutationFn: (bookingId: number) =>
			updateBooking(bookingId, {
				status: "checked-out",
			}),

		onSuccess: (data) => {
			toast.success(`Booking #${data.id} successfully checked out`);
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
			queryClient.invalidateQueries({ queryKey: ["booking", data.id] });
		},

		onError: () => toast.error("There was an error while checking out"),
	});

	return { checkout, isCheckingOut };
}
