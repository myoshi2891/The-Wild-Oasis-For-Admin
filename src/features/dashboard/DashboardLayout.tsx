import styled from "styled-components";
import Spinner from "../../ui/Spinner";
import { useRecentBookings } from "./useRecentBookings";
import { useRecentStays } from "./useRecentStays";
import Stats from "./Stats";
import { useCabins } from "../cabins/useCabins";
import SalesChart from "./SalesChart";
import DurationChart from "./DurationChart";
import TodayActivity from "../check-in-out/TodayActivity";

const StyledDashboardLayout = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	grid-template-rows: auto 34rem auto;
	gap: 2.4rem;
`;

/**
 * Render the dashboard grid containing statistics, today's activity, and charts; displays a spinner while required data is loading.
 *
 * @returns The dashboard JSX element: a styled grid with Stats, TodayActivity, DurationChart, and SalesChart, or a Spinner when bookings, stays, or cabins are loading.
 */
function DashboardLayout() {
	const { bookings, isLoading: isLoadingBookings } = useRecentBookings();
	const { confirmedStays, isLoading: isLoadingStays, numDays } = useRecentStays();
	const { cabins, isLoading: isLoadingCabins } = useCabins();

	if (isLoadingBookings || isLoadingStays || isLoadingCabins) return <Spinner />;

	return (
		<StyledDashboardLayout>
			<Stats
				bookings={bookings || []}
				confirmedStays={confirmedStays || []}
				numDays={numDays}
				cabinCount={cabins?.length ?? 0}
			/>
			<TodayActivity />
			<DurationChart confirmedStays={confirmedStays || []} />
			<SalesChart bookings={bookings || []} numDays={numDays} />
		</StyledDashboardLayout>
	);
}

export default DashboardLayout;
