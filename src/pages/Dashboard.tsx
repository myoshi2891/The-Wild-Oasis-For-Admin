import DashboardFilter from "../features/dashboard/DashboardFilter";
import DashboardLayout from "../features/dashboard/DashboardLayout";
import Heading from "../ui/Heading";
import Row from "../ui/Row";

/**
 * Renders the main dashboard view with a header and the dashboard layout.
 *
 * The header row includes the page heading and the dashboard filter; the layout
 * renders the dashboard's content area.
 *
 * @returns A React element containing the dashboard UI.
 */
function Dashboard() {
	return (
		<>
			<Row $type="horizontal">
				<Heading as="h1">Dashboard</Heading>
				<DashboardFilter />
			</Row>

			<DashboardLayout />
		</>
	);
}

export default Dashboard;
