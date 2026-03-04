import type { ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import Select from "./Select";
import type { SelectOption } from "./Select";

interface SortByProps {
	options: SelectOption[];
}

/**
 * Renders a Select that is synchronized with the "sortBy" URL query parameter.
 *
 * Selecting an option updates the "sortBy" parameter in the current search params.
 *
 * @param options - Options to display in the Select
 * @returns The Select element configured with the provided options and the current `sortBy` value
 */
function SortBy({ options }: SortByProps) {
	const [searchParams, setSearchParams] = useSearchParams();
	const sortBy = searchParams.get("sortBy") || "";

	function handleChange(e: ChangeEvent<HTMLSelectElement>) {
		searchParams.set("sortBy", e.target.value);
		setSearchParams(searchParams);
	}

	return (
		<Select
			options={options}
			$type="white"
			value={sortBy}
			onChange={handleChange}
		/>
	);
}

export default SortBy;
