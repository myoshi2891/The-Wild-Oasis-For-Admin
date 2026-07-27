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
import { useNavigate } from "react-router";
import { HiArrowUpOnSquare } from "react-icons/hi2";
import { useCheckout } from "../check-in-out/useCheckout";
import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";
import { useDeleteBooking } from "./useDeleteBooking";
import { getTagType } from "../../utils/helpers";

const HeadingGroup = styled.div`
	display: flex;
	gap: 2.4rem;
	align-items: center;
`;

const ActionContent = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 0.8rem;
`;

/**
 * Render the detailed view for a single booking, including its status and contextual actions.
 *
 * Shows a loading spinner while the booking is being fetched and an empty booking state if no booking is available.
 *
 * @returns A React element that displays the booking information, a status tag, and contextual action controls (check in, check out, delete, and navigation)
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

	return (
		<>
			<Row $type="horizontal">
				<HeadingGroup>
					<Heading as="h1">Booking #{bookingId}</Heading>
					<Tag $type={getTagType(status)}>
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
						<ActionContent>
							<HiArrowUpOnSquare />
							<span>Check out</span>
						</ActionContent>
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
