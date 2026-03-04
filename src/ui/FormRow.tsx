import { isValidElement, type ReactNode } from "react";
import styled from "styled-components";

interface FormRowProps {
	label?: string;
	error?: string;
	children: ReactNode;
}

const StyledFormRow = styled.div`
	display: grid;
	align-items: center;
	grid-template-columns: 24rem 1fr 1.2fr;
	gap: 2.4rem;

	padding: 1.2rem 0;

	&:first-child {
		padding-top: 0;
	}

	&:last-child {
		padding-bottom: 0;
	}

	&:not(:last-child) {
		border-bottom: 1px solid var(--color-grey-100);
	}

	&:has(button) {
		display: flex;
		justify-content: flex-end;
		gap: 1.2rem;
	}
`;

const Label = styled.label`
	font-weight: 500;
`;

const Error = styled.span`
	font-size: 1.4rem;
	color: var(--color-red-700);
`;

/**
 * Renders a form row containing an optional label, the provided children, and an optional error message.
 *
 * The label's `htmlFor` will be set to the child's `id` when the child is a valid React element with an `id` prop.
 *
 * @param label - Optional label text displayed to the left of the control
 * @param error - Optional error text displayed to the right of the control
 * @param children - The form control or nodes for the row; if a React element with an `id` prop, that `id` is used for the label's `htmlFor`
 * @returns A JSX element representing the composed form row
 */
function FormRow({ label, error, children }: FormRowProps) {
	const childId = isValidElement<{ id?: string }>(children)
		? children.props.id
		: undefined;

	return (
		<StyledFormRow>
			{label && <Label htmlFor={childId}>{label}</Label>}
			{children}
			{error && <Error>{error}</Error>}
		</StyledFormRow>
	);
}

export default FormRow;

