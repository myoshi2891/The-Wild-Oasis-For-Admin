import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout as logoutApi } from "../../services/apiAuth";
import { useNavigate } from "react-router-dom";

export function useLogout() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// React Query v5: mutation の isLoading は isPending にリネーム。公開戻り値名は isLoading を維持
	const { mutate: logout, isPending: isLoading } = useMutation({
		mutationFn: logoutApi,
		onSuccess: () => {
			queryClient.removeQueries();
			navigate("/login", { replace: true });
		},
	});
	return { logout, isLoading };
}
