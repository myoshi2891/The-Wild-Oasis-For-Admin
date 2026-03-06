import styled from "styled-components";

import BookingDataBox from "./BookingDataBox";
import Row from "../../ui/Row";
import Heading from "../../ui/Heading";
import Tag from "../../ui/Tag";
import ButtonGroup from "../../ui/ButtonGroup";
import Button from "../../ui/Button";
import ButtonText from "../../ui/ButtonText";
import Empty from "../../ui/Empty";

import { useMoveBack } from "../../hooks/useMoveBack";
import { useBooking } from "./useBooking";
import Spinner from "../../ui/Spinner";
import { useNavigate } from "react-router-dom";
import { HiArrowUpOnSquare } from "react-icons/hi2";
import { useCheckout } from "../check-in-out/useCheckout";
import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";
import { useDeleteBooking } from "./useDeleteBooking";

const HeadingGroup = styled.div`
	display: flex;
	gap: 2.4rem;
	align-items: center;
`;

/**
 * Render a detailed view of a single booking including status and contextual actions.
 *
 * Displays a loading spinner while the booking is being fetched and an empty state if no booking is available.
 * Shows the booking ID, a status tag, booking details, and action controls: check in (when unconfirmed), check out (when checked-in), delete (with confirmation), and back navigation.
 * Action controls are disabled while their respective operations are in progress; after deletion the view navigates back.
 *
 * @returns A React element presenting the booking details, status tag, and contextual action controls
 */
function BookingDetail() {
	const { booking, isLoading } = useBooking();
	const { checkout, isCheckingOut } = useCheckout();
	const { deleteBooking, isDeleting } = useDeleteBooking();

	const moveBack = useMoveBack();
	const navigate = useNavigate();

	if (isLoading) return <Spinner />;
	if (!booking) return <Empty resourceName="booking" />;

	const { status, id: bookingId } = booking;

	const statusToTagName: Record<string, "blue" | "green" | "silver"> = {
		unconfirmed: "blue",
		"checked-in": "green",
		"checked-out": "silver",
	};

	return (
		<>
			<Row $type="horizontal">
				<HeadingGroup>
					<Heading as="h1">Booking #{bookingId}</Heading>
					<Tag $type={statusToTagName[status]}>
						{status.replace("-", " ")}
					</Tag>
				</HeadingGroup>
				<ButtonText onClick={moveBack}>&larr; Back</ButtonText>
			</Row>

			<BookingDataBox booking={booking} />

			<ButtonGroup>
				{status === "unconfirmed" && (
					<Button onClick={() => navigate(`/checkin/${bookingId}`)}>
						Check in
					</Button>
				)}

				{status === "checked-in" && (
					<Button
						onClick={() => checkout(bookingId)}
						disabled={isCheckingOut}
					>
						<HiArrowUpOnSquare /> Check out
					</Button>
				)}

				<Modal>
					<Modal.Open opens="delete">
						<Button variation="danger">Delete booking</Button>
					</Modal.Open>

					<Modal.Window name="delete">
						<ConfirmDelete
							resourceName="booking"
							disabled={isDeleting}
							onConfirm={() =>
								deleteBooking(bookingId, {
									onSettled: () => navigate(-1),
								})
							}
						/>
					</Modal.Window>
				</Modal>

				<Button variation="secondary" onClick={moveBack}>
					Back
				</Button>
			</ButtonGroup>
		</>
	);
}

export default BookingDetail;
