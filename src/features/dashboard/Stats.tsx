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

function Stats({ bookings, confirmedStays, numDays, cabinCount }: StatsProps) {
	const numBookings = bookings?.length ?? 0;

	const sales = bookings?.reduce((acc, cur) => acc + cur.totalPrice, 0) ?? 0;

	const checkins = confirmedStays?.length ?? 0;

	const occupation =
		(confirmedStays?.reduce((acc, cur) => acc + cur.numNights, 0) ?? 0) /
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
