import Heading from "../ui/Heading";
import Row from "../ui/Row";
import BookingTable from "../features/bookings/BookingTable";
import BookingTableOperations from "../features/bookings/BookingTableOperations";

/**
 * Renders the bookings page header and table with available booking operations.
 *
 * @returns A React element containing a horizontal row with the page heading and booking operations, followed by the bookings table.
 */
function Bookings() {
	return (
		<>
			<Row $type="horizontal">
				<Heading as="h1">All bookings</Heading>
				<BookingTableOperations />
			</Row>
			<BookingTable />
		</>
	);
}

export default Bookings;
