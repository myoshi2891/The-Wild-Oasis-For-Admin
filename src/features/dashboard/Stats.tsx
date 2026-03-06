import { formatCurrency } from "../../utils/helpers";
import Stat from "./Stat";
import {
	HiOutlineBanknotes,
	HiOutlineBriefcase,
	HiOutlineCalendarDays,
	HiOutlineChartBar,
} from "react-icons/hi2";
import type { BookingAfterDate, StayAfterDate } from "../../types/domain";

export interface StatsProps {
	bookings: BookingAfterDate[];
	confirmedStays: StayAfterDate[];
	numDays: number;
	cabinCount: number;
}

/**
 * Renders four summary Stat components for bookings, sales, check-ins, and occupancy rate.
 *
 * @param bookings - Bookings to derive count and total sales from.
 * @param confirmedStays - Confirmed stays to derive check-ins and total nights from.
 * @param numDays - Number of days in the reporting period used to compute occupancy.
 * @param cabinCount - Number of cabins used to compute occupancy (treated as at least 1).
 * @returns A React fragment containing Stat components for Booking, Sales, Check ins, and Occupancy rate.
 */
function Stats({ bookings, confirmedStays, numDays, cabinCount }: StatsProps) {
	const numBookings = bookings.length;

	const sales = bookings.reduce((acc, cur) => acc + cur.totalPrice, 0);

	const checkins = confirmedStays.length;

	const occupation =
		confirmedStays.reduce((acc, cur) => acc + cur.numNights, 0) /
		(numDays * Math.max(cabinCount, 1));

	return (
		<>
			<Stat
				title="Booking"
				color="blue"
				icon={<HiOutlineBriefcase />}
				value={numBookings}
			/>
			<Stat
				title="Sales"
				color="green"
				icon={<HiOutlineBanknotes />}
				value={formatCurrency(sales)}
			/>
			<Stat
				title="Check ins"
				color="indigo"
				icon={<HiOutlineCalendarDays />}
				value={checkins}
			/>
			<Stat
				title="Occupancy rate"
				color="yellow"
				icon={<HiOutlineChartBar />}
				value={Math.round(occupation * 100) + "%"}
			/>
		</>
	);
}

export default Stats;
