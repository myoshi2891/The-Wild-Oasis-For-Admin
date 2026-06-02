import { useMutation } from "@tanstack/react-query";
import { signup as signupApi } from "../../services/apiAuth";
import toast from "react-hot-toast";

/**
 * Provides a mutation for creating a new user account and exposes its loading state.
 *
 * The `signup` function triggers the signup request; `isLoading` indicates whether the request is in progress.
 *
 * @returns An object containing:
 * - `signup`: a function to invoke the signup mutation
 * - `isLoading`: `true` while the signup request is in progress, `false` otherwise
 */
export function useSignup() {
	// React Query v5: mutation の isLoading は isPending にリネーム。公開戻り値名は isLoading を維持
	const { mutate: signup, isPending: isLoading } = useMutation({
		mutationFn: signupApi,
		onSuccess: () => {
			toast.success(
				"Account successfully created! Please verify the new account from the user's email address"
			);
		},
	});

	return { signup, isLoading };
}
