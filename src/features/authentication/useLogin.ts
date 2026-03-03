import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi } from "../../services/apiAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function useLogin() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { mutate: login, isLoading } = useMutation({
		mutationFn: loginApi,
		onSuccess: (user) => {
			queryClient.setQueryData(["user"], user.user);
			navigate("/dashboard", { replace: true });
		},
		onError: (err: Error) => {
			if (import.meta.env.DEV) console.error("Login error:", err);
			toast.error("Provided email and password are incorrect...");
		},
	});

	return { login, isLoading };
}
