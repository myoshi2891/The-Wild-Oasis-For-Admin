import styled from "styled-components";
import Spinner from "../../ui/Spinner";
import { useRecentBookings } from "./useRecentBookings";
import { useRecentStays } from "./useRecentStays";

const StyledDashboardLayout = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	grid-template-rows: auto 34rem auto;
	gap: 2.4rem;
`;

function DashboardLayout() {
	const { bookings, isLoading1 } = useRecentBookings();
	const { stays, confirmedStays, isLoading: isLoading2 } = useRecentStays();

	if (isLoading1 || isLoading2) return <Spinner />;
	console.log(bookings);
	return (
		<StyledDashboardLayout>
			<div>Statistics</div>
			<div>Today's activity</div>
			<div>Today's activity</div>
			<div>Chart...</div>
		</StyledDashboardLayout>
	);
}

export default DashboardLayout;
