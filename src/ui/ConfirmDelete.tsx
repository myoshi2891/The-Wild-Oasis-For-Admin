import styled from "styled-components";
import Button from "./Button";
import Heading from "./Heading";

const StyledConfirmDelete = styled.div`
  width: 40rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;

  & p {
    color: var(--color-grey-500);
    margin-bottom: 1.2rem;
  }

  & div {
    display: flex;
    justify-content: flex-end;
    gap: 1.2rem;
  }
`;

interface ConfirmDeleteProps {
	resourceName: string;
	onConfirm: () => void;
	disabled?: boolean;
	onCloseModal?: () => void;
}

/**
 * Displays a confirmation dialog for permanently deleting a named resource.
 *
 * @param resourceName - The human-readable name of the resource shown in the heading and message.
 * @param onConfirm - Callback invoked when the "Delete" button is clicked.
 * @param disabled - If true, disables both "Cancel" and "Delete" buttons.
 * @param onCloseModal - Optional callback invoked when the "Cancel" button is clicked.
 * @returns The confirmation dialog UI as a JSX element.
 */
function ConfirmDelete({ resourceName, onConfirm, disabled, onCloseModal }: ConfirmDeleteProps) {
	return (
		<StyledConfirmDelete>
			<Heading as="h3">Delete {resourceName}</Heading>
			<p>
				Are you sure you want to delete this {resourceName} permanently?
				This action cannot be undone.
			</p>

			<div>
				<Button
					variation="secondary"
					disabled={disabled}
					onClick={onCloseModal}
				>
					Cancel
				</Button>
				<Button
					variation="danger"
					disabled={disabled}
					onClick={onConfirm}
				>
					Delete
				</Button>
			</div>
		</StyledConfirmDelete>
	);
}

export default ConfirmDelete;
