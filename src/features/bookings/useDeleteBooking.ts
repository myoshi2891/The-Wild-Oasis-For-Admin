import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteBooking as deleteBookingApi } from "../../services/apiBookings";

/**
 * React hook that provides a mutation to delete a booking and manages related UI updates.
 *
 * On successful deletion, shows a success toast and invalidates the "bookings" query; on error, shows an error toast with the error message.
 *
 * @returns An object containing:
 * - `isDeleting` — `true` when a delete operation is in progress, `false` otherwise.
 * - `deleteBooking` — mutation function used to trigger deletion of a booking.
 */
export function useDeleteBooking() {
	const queryClient = useQueryClient();

	const { isLoading: isDeleting, mutate: deleteBooking } = useMutation({
		mutationFn: deleteBookingApi,
		onSuccess: () => {
			toast.success("Booking was successfully deleted!");

			queryClient.invalidateQueries({
				queryKey: ["bookings"],
			});
		},
		onError: (err: Error) => toast.error(err.message),
	});

	return { isDeleting, deleteBooking };
}
