import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBooking } from "../../services/apiBookings";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { Booking } from "../../types/domain";

interface CheckinParams {
	bookingId: number;
	breakfast?: Partial<Booking>;
}

export function useCheckin() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { mutate: checkin, isLoading: isCheckingIn } = useMutation({
		mutationFn: ({ bookingId, breakfast }: CheckinParams) =>
			updateBooking(bookingId, {
				status: "checked-in",
				isPaid: true,
				...breakfast,
			}),

		onSuccess: (data) => {
			toast.success(`Booking #${data.id} successfully checked in`);
			queryClient.invalidateQueries();
			navigate("/");
		},

		onError: () => toast.error("There was an error while checking in"),
	});

	return { checkin, isCheckingIn };
}
