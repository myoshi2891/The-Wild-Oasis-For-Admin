import { useNavigate } from "react-router-dom";

/**
 * Creates a callback that navigates back one entry in the router history.
 *
 * @returns A zero-argument function which, when invoked, navigates back one entry in the history stack.
 */
export function useMoveBack(): () => void {
	const navigate = useNavigate();
	return () => navigate(-1);
}
