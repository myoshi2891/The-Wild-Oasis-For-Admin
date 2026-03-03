import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBooking } from "../../services/apiBookings";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface BreakfastInput {
	hasBreakfast: boolean;
	extrasPrice: number;
	totalPrice: number;
}

interface CheckinParams {
	bookingId: number;
	breakfast?: BreakfastInput;
}

export function useCheckin() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { mutate: checkin, isLoading: isCheckingIn } = useMutation({
		mutationFn: ({ bookingId, breakfast }: CheckinParams) =>
			updateBooking(bookingId, {
				...breakfast,
				status: "checked-in",
				isPaid: true,
			}),

		onSuccess: (data) => {
			toast.success(`Booking #${data.id} successfully checked in`);
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
			navigate("/");
		},

		onError: () => toast.error("There was an error while checking in"),
	});

	return { checkin, isCheckingIn };
}
