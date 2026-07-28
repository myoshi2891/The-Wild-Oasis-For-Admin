import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi } from "../../services/apiAuth";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

/**
 * Hook that performs user login and handles success/error side effects.
 *
 * On success, the hook updates the cached `"user"` data and navigates to `/dashboard`. On error, it shows a toast error message.
 *
 * @returns An object with:
 * - `login` — a function to trigger the login request (accepts the login API input, e.g., `{ email, password }`).
 * - `isLoading` — `true` while the login request is in progress, `false` otherwise.
 */
export function useLogin() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	// React Query v5: mutation の isLoading は isPending にリネーム。公開戻り値名は isLoading を維持
	const { mutate: login, isPending: isLoading } = useMutation({
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
