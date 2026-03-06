import Button from "../../ui/Button";
import { useCheckout } from "./useCheckout";

interface CheckoutButtonProps {
	bookingId: number;
}

/**
 * Renders a "Check out" button that triggers checkout for a booking.
 *
 * @param bookingId - The ID of the booking to check out when the button is clicked
 * @returns The rendered checkout button component
 */
function CheckoutButton({ bookingId }: CheckoutButtonProps) {
	const { checkout, isCheckingOut } = useCheckout();
	return (
		<Button
			variation="primary"
			size="small"
			onClick={() => checkout(bookingId)}
			disabled={isCheckingOut}
		>
			Check out
		</Button>
	);
}

export default CheckoutButton;
