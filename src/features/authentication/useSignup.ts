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
	const { mutate: signup, isLoading } = useMutation({
		mutationFn: signupApi,
		onSuccess: () => {
			toast.success(
				"Account successfully created! Please verify the new account from the user's email address"
			);
		},
	});

	return { signup, isLoading };
}
