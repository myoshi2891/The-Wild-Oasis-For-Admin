interface EmptyProps {
	resourceName: string;
}

/**
 * Renders a simple empty-state message for a given resource.
 *
 * @param resourceName - The resource label to insert into the message (e.g., "users")
 * @returns A paragraph element containing "No {resourceName} could be found."
 */
function Empty({ resourceName }: EmptyProps) {
	return <p>No {resourceName} could be found.</p>;
}

export default Empty;
