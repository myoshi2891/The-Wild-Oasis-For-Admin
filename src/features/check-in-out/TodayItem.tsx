import styled from "styled-components";
import { Link } from "react-router-dom";
import Tag from "../../ui/Tag";
import Flag from "../../ui/Flag";
import Button from "../../ui/Button";
import CheckoutButton from "./CheckoutButton";

const StyledTodayItem = styled.li`
	display: grid;
	grid-template-columns: 9rem 2rem 1fr 7rem 9rem;
	gap: 1.2rem;
	align-items: center;

	font-size: 1.4rem;
	padding: 0.8rem 0;
	border-bottom: 1px solid var(--color-grey-100);

	&:first-child {
		border-top: 1px solid var(--color-grey-100);
	}
`;

const Guest = styled.div`
	font-weight: 500;
`;

/**
 * Renders a single today's activity row showing guest, flag, nights and a context-specific action.
 *
 * The row displays a status Tag ("Arriving" for "unconfirmed", "Departing" for "checked-in"), the guest's country flag and full name, the number of nights, and an action control: a "Check in" link when `status` is "unconfirmed" or a checkout control when `status` is "checked-in".
 *
 * @param activity - Activity object with shape `{ id, status, guests, numNights }`. `status` is expected to be either `"unconfirmed"` or `"checked-in"`. `guests` must include `fullName`, `nationality`, and `countryFlag`.
 * @returns A React element representing the styled list item for the activity.
 */
import type { BookingWithGuestInfo } from "../../types/domain";

interface TodayItemProps {
	activity: BookingWithGuestInfo;
}

function TodayItem({ activity }: TodayItemProps) {
	const { id, status, guests, numNights } = activity;

	return (
		<StyledTodayItem>
			{status === "unconfirmed" && <Tag $type="green">Arriving</Tag>}
			{status === "checked-in" && <Tag $type="blue">Departing</Tag>}

			<Flag
				src={guests.countryFlag}
				alt={`Flag of ${guests.nationality}`}
			/>
			<Guest>{guests.fullName}</Guest>
			<div>{numNights} nights</div>

			{status === "unconfirmed" && (
				<Button
					size="small"
					variation="primary"
					as={Link}
					to={`/checkin/${id}`}
				>
					Check in
				</Button>
			)}

			{status === "checked-in" && <CheckoutButton bookingId={id} />}
		</StyledTodayItem>
	);
}

export default TodayItem;
