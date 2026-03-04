import { isValidElement, type ReactNode } from "react";
import styled from "styled-components";

interface FormRowVerticalProps {
	label?: string;
	error?: string;
	children: ReactNode;
}

const StyledFormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.2rem 0;
`;

const Label = styled.label`
  font-weight: 500;
`;

const Error = styled.span`
  font-size: 1.4rem;
  color: var(--color-red-700);
`;

/**
 * Renders a vertically stacked form row with an optional label and error message.
 *
 * The label, when provided, is associated with the child element if the child has an `id` prop.
 *
 * @param label - Optional label text to display above the child content; if the child element has an `id`, the label will be linked to it.
 * @param error - Optional error text displayed below the child content.
 * @param children - The content of the row (typically a form control); if this child is a React element with an `id`, that `id` is used for the label association.
 * @returns A container element that lays out the label, children, and error message vertically.
 */
function FormRowVertical({ label, error, children }: FormRowVerticalProps) {
	const htmlFor =
		isValidElement<{ id?: string }>(children) ? children.props.id : undefined;

	return (
		<StyledFormRow>
			{label && <Label htmlFor={htmlFor}>{label}</Label>}
			{children}
			{error && <Error>{error}</Error>}
		</StyledFormRow>
	);
}

export default FormRowVertical;
