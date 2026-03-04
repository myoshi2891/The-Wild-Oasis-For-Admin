import Heading from "../ui/Heading";
import Row from "../ui/Row";
import CabinTable from "../features/cabins/CabinTable";
import AddCabin from "../features/cabins/AddCabin";
import CabinTableOperations from "../features/cabins/CabinTableOperations";

/**
 * Render the cabins management UI.
 *
 * @returns A JSX element containing a horizontal header row with an "All cabins" heading and table operations, followed by a row with the cabin table and an add-cabin form.
 */
function Cabins() {
	return (
		<>
			<Row $type="horizontal">
				<Heading as="h1">All cabins</Heading>
				<CabinTableOperations />
			</Row>
			<Row>
				<CabinTable />
				<AddCabin />
			</Row>
		</>
	);
}

export default Cabins;
