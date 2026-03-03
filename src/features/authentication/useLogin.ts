import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi } from "../../services/apiAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface LoginParams {
	email: string;
	password: string;
}

export function useLogin() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { mutate: login, isLoading } = useMutation({
		mutationFn: ({ email, password }: LoginParams) =>
			loginApi({ email, password }),
		onSuccess: (user) => {
			queryClient.setQueryData(["user"], user.user);
			navigate("/dashboard", { replace: true });
		},
		onError: (err: Error) => {
			console.log("ERROR", err);
			toast.error("Provided email and password are incorrect...");
		},
	});

	return { login, isLoading };
}
