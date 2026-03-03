import type { Cabin } from "../../types/domain";
import Spinner from "../../ui/Spinner";
import CabinRow from "./CabinRow";
import { useCabins } from "./useCabins";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import { useSearchParams } from "react-router-dom";
import Empty from "../../ui/Empty";

function CabinTable() {
	const { isLoading, cabins } = useCabins();
	const [searchParams] = useSearchParams();

	if (isLoading) return <Spinner />;
	if (!cabins?.length) return <Empty resourceName="cabins" />;

	const filterValue = searchParams.get("discount") || "all";

	let filteredCabins = cabins;
	if (filterValue === "no-discount")
		filteredCabins = cabins!.filter((cabin) => cabin.discount === 0);
	if (filterValue === "with-discount")
		filteredCabins = cabins!.filter((cabin) => cabin.discount > 0);

	const sortBy = searchParams.get("sortBy") || "name-asc";
	const [field, direction] = sortBy.split("-");
	const modifier = direction === "asc" ? 1 : -1;
	// const sortedCabins = filteredCabins.sort(
	// 	(a, b) => (a[field] - b[field]) * modifier
	// );

	const allowedSortKeys: (keyof Cabin)[] = [
		"name",
		"maxCapacity",
		"regularPrice",
		"discount",
	];
	const safeKey: keyof Cabin = allowedSortKeys.includes(
		field as keyof Cabin
	)
		? (field as keyof Cabin)
		: "name";

	const sortedCabins = filteredCabins
		? [...filteredCabins].sort((a: Cabin, b: Cabin) => {
				const aVal = a[safeKey];
				const bVal = b[safeKey];
				if (typeof aVal === "string" && typeof bVal === "string") {
					return aVal.localeCompare(bVal) * modifier;
				}
				return (
					((Number(aVal) || 0) - (Number(bVal) || 0)) * modifier
				);
			})
		: [];

	return (
		<Menus>
			<Table columns="0.6fr 1.8fr 2.2fr 1fr 1fr 1fr">
				<Table.Header>
					<div></div>
					<div>Cabin</div>
					<div>Capacity</div>
					<div>Price</div>
					<div>Discount</div>
					<div></div>
				</Table.Header>

				<Table.Body
					data={sortedCabins}
					render={(cabin) => (
						<CabinRow cabin={cabin} key={cabin.id} />
					)}
				/>
			</Table>
		</Menus>
	);
}

export default CabinTable;
