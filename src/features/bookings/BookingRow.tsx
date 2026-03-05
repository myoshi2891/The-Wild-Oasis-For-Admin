import styled from "styled-components";
import { format, isToday } from "date-fns";
import {
	HiArrowDownOnSquare,
	HiArrowUpOnSquare,
	HiEye,
	HiTrash,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

import Tag from "../../ui/Tag";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";

import { formatCurrency } from "../../utils/helpers";
import { formatDistanceFromNow } from "../../utils/helpers";

import { useCheckout } from "../check-in-out/useCheckout";
import { useDeleteBooking } from "./useDeleteBooking";

const Cabin = styled.div`
	font-size: 1.6rem;
	font-weight: 600;
	color: var(--color-grey-600);
	font-family: "Sono";
`;

const Stacked = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.2rem;

	& span:first-child {
		font-weight: 500;
	}

	& span:last-child {
		color: var(--color-grey-500);
		font-size: 1.2rem;
	}
`;

const Amount = styled.div`
	font-family: "Sono";
	font-weight: 500;
`;

/**
 * Render a table row showing a booking's cabin, guest, dates, status, amount, and contextual actions.
 *
 * @param booking - Booking object containing identifiers and display fields:
 *   - id: booking identifier
 *   - startDate, endDate: ISO date strings or Date-compatible values for the stay range
 *   - numNights: number of nights for the booking
 *   - totalPrice: numeric total price to display
 *   - status: booking status string (e.g., "unconfirmed", "checked-in", "checked-out")
 *   - guests: object with `fullName` and `email`
 *   - cabins: object with `name`
 * @returns A table row element displaying the booking's information and action menu for navigation, check-in/out, and deletion.
 */
function BookingRow({
	booking: {
		id: bookingId,
		startDate,
		endDate,
		numNights,
		totalPrice,
		status,
		guests: { fullName: guestName, email },
		cabins: { name: cabinName },
	},
}: any) {
	const navigate = useNavigate();
	const { checkout, isCheckingOut } = useCheckout();
	const { deleteBooking, isDeleting } = useDeleteBooking();

	const statusToTagName = {
		unconfirmed: "blue",
		"checked-in": "green",
		"checked-out": "silver",
	};

	return (
		<Table.Row>
			<Cabin>{cabinName}</Cabin>

			<Stacked>
				<span>{guestName}</span>
				<span>{email}</span>
			</Stacked>

			<Stacked>
				<span>
					{isToday(new Date(startDate))
						? "Today"
						: formatDistanceFromNow(startDate)}{" "}
					&rarr; {numNights} night stay
				</span>
				<span>
					{format(new Date(startDate), "MMM dd yyyy")} &mdash;{" "}
					{format(new Date(endDate), "MMM dd yyyy")}
				</span>
			</Stacked>

			<Tag $type={statusToTagName[status as keyof typeof statusToTagName] as any}>{status.replace("-", " ")}</Tag>

			<Amount>{formatCurrency(totalPrice)}</Amount>

			<Modal>
				<Menus.Menu>
					<Menus.Toggle id={bookingId} />
					<Menus.List id={bookingId}>
						<Menus.Button
							icon={<HiEye />}
							onClick={() => navigate(`/bookings/${bookingId}`)}
						>
							See details
						</Menus.Button>
						{status === "unconfirmed" && (
							<Menus.Button
								icon={<HiArrowDownOnSquare />}
								onClick={() =>
									navigate(`/checkin/${bookingId}`)
								}
							>
								Check in
							</Menus.Button>
						)}
						{status === "checked-in" && (
							<Menus.Button
								icon={<HiArrowUpOnSquare />}
								onClick={() => checkout(bookingId)}
								disabled={isCheckingOut}
							>
								Check out
							</Menus.Button>
						)}

						<Modal.Open opens="delete">
							<Menus.Button icon={<HiTrash />}>
								Delete booking
							</Menus.Button>
						</Modal.Open>
					</Menus.List>
				</Menus.Menu>
				<Modal.Window name="delete">
					<ConfirmDelete
						resourceName="booking"
						disabled={isDeleting}
						onConfirm={() => deleteBooking(bookingId)}
					/>
				</Modal.Window>
			</Modal>
		</Table.Row>
	);
}

export default BookingRow;
