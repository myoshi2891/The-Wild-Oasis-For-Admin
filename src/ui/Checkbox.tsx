import type { ChangeEvent, ReactNode } from "react";
import styled from "styled-components";

const StyledCheckbox = styled.div`
  display: flex;
  gap: 1.6rem;

  & input[type="checkbox"] {
    height: 2.4rem;
    width: 2.4rem;
    outline-offset: 2px;
    transform-origin: 0;
    accent-color: var(--color-brand-600);
  }

  & input[type="checkbox"]:disabled {
    accent-color: var(--color-brand-600);
  }

  & label {
    flex: 1;

    display: flex;
    align-items: center;
    gap: 0.8rem;
  }
`;

interface CheckboxProps {
	checked: boolean;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	disabled?: boolean;
	id: string;
	children: ReactNode;
}

/**
 * Render a controlled checkbox input with an associated label.
 *
 * @param checked - Whether the checkbox is checked.
 * @param onChange - Handler invoked when the checkbox value changes.
 * @param disabled - If true, disables the input and prevents the label from being associated with the input.
 * @param id - Identifier used for the input's `id` and the label's `htmlFor` when not disabled.
 * @param children - Content rendered inside the label.
 * @returns A JSX element containing the checkbox and its label.
 */
function Checkbox({ checked, onChange, disabled = false, id, children }: CheckboxProps) {
  return (
    <StyledCheckbox>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <label htmlFor={!disabled ? id : ""}>{children}</label>
    </StyledCheckbox>
  );
}

export default Checkbox;
