import type { ChangeEvent, ComponentPropsWithoutRef } from "react";
import styled from "styled-components";

interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps
	extends Omit<
		ComponentPropsWithoutRef<"select">,
		"value" | "onChange"
	> {
	options: SelectOption[];
	value: string;
	onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
	$type?: "white" | "default";
}

const StyledSelect = styled.select<{ $type?: "white" | "default" }>`
  font-size: 1.4rem;
  padding: 0.8rem 1.2rem;
  border: 1px solid
    ${(props) =>
      props.$type === "white"
        ? "var(--color-grey-100)"
        : "var(--color-grey-300)"};
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-0);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
`;

/**
 * A styled select input that renders the provided options and forwards change events.
 *
 * @param options - Array of option objects with `value` and `label` to render as <option> children
 * @param value - The currently selected option value
 * @param onChange - Called when the selection changes with the native change event
 * @param $type - Optional styling variant; `"white"` alters border/background styling
 * @returns The rendered `<select>` element populated with the given options
 */
function Select({ options, value, onChange, $type, ...props }: SelectProps) {
	return (
		<StyledSelect value={value} onChange={onChange} $type={$type} {...props}>
			{options.map((option) => (
				<option value={option.value} key={option.value}>
					{option.label}
				</option>
			))}
		</StyledSelect>
	);
}

export default Select;
export type { SelectOption };
