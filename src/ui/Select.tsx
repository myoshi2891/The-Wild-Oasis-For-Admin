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
	type?: string;
}

const StyledSelect = styled.select<{ type?: string }>`
  font-size: 1.4rem;
  padding: 0.8rem 1.2rem;
  border: 1px solid
    ${(props) =>
      props.type === "white"
        ? "var(--color-grey-100)"
        : "var(--color-grey-300)"};
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-0);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
`;

function Select({ options, value, onChange, ...props }: SelectProps) {
	return (
		<StyledSelect value={value} onChange={onChange} {...props}>
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
