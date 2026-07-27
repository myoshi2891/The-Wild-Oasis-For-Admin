import { useSearchParams } from "react-router";
import styled, { css } from "styled-components";
import type { SelectOption } from "./Select";

const StyledFilter = styled.div`
	border: 1px solid var(--color-grey-100);
	background-color: var(--color-grey-0);
	box-shadow: var(--shadow-sm);
	border-radius: var(--border-radius-sm);
	padding: 0.4rem;
	display: flex;
	gap: 0.4rem;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
	background-color: var(--color-grey-0);
	border: none;

	${(props) =>
		props.$active &&
		css`
			background-color: var(--color-brand-600);
			color: var(--color-brand-50);
		`}

	border-radius: var(--border-radius-sm);
	font-weight: 500;
	font-size: 1.4rem;
	/* To give the same height as select */
	padding: 0.44rem 0.8rem;
	transition: all 0.3s;

	&:hover:not(:disabled) {
		background-color: var(--color-brand-600);
		color: var(--color-brand-50);
	}
`;

interface FilterProps {
	filterField: string;
	options: SelectOption[];
}

/**
 * Renders a set of filter buttons bound to a URL search parameter.
 *
 * The component reads the current filter value from the URL using `filterField`. If that parameter is absent, it falls back to the first option's `value` when `options` is non-empty, otherwise an empty string. Clicking a button updates the `filterField` search parameter to the clicked option's `value`; if a `page` parameter exists it is reset to `"1"`.
 *
 * @param filterField - The name of the URL search parameter used to store the selected filter.
 * @param options - Array of available options; each option's `value` is used for the URL parameter and `label` is displayed in the button.
 * @returns The rendered filter control as a JSX element.
 */
function Filter({ filterField, options }: FilterProps) {
	const [searchParams, setSearchParams] = useSearchParams();
	const currentFilter =
		searchParams.get(filterField) || (options.length > 0 ? options[0].value : "");

	function handleClick(value: string) {
		searchParams.set(filterField, value);
		if (searchParams.get("page")) searchParams.set("page", "1");
		setSearchParams(searchParams);
	}

	return (
		<StyledFilter>
			{options.map((option) => (
				<FilterButton
					key={option.value}
					onClick={() => handleClick(option.value)}
					$active={option.value === currentFilter}
					disabled={option.value === currentFilter}
				>
					{option.label}
				</FilterButton>
			))}
		</StyledFilter>
	);
}

export default Filter;
