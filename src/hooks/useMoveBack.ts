import { useNavigate } from "react-router-dom";

export function useMoveBack(): () => void {
	const navigate = useNavigate();
	return () => navigate(-1);
}
