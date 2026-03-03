interface EmptyProps {
	resourceName: string;
}

function Empty({ resourceName }: EmptyProps) {
	return <p>No {resourceName} could be found.</p>;
}

export default Empty;
