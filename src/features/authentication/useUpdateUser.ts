import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateCurrentUser } from "../../services/apiAuth";
import type { User } from "@supabase/supabase-js";

/**
 * Provides a mutation hook to update the current user's account and keep the cached user in sync.
 *
 * @returns An object with:
 * - `isUpdating` — `true` while the update mutation is in progress, `false` otherwise.
 * - `updateUser` — a function that triggers the update mutation (accepts the same payload as `updateCurrentUser`).
 */
export function useUpdateUser() {
	const queryClient = useQueryClient();

	const { mutate: updateUser, isPending: isUpdating } = useMutation({
		mutationFn: updateCurrentUser,
		onSuccess: (data: { user: User }) => {
			toast.success("User account successfully updated.");
			if (data?.user) queryClient.setQueryData(["user"], data.user);
		},
		onError: (err: Error) => toast.error(err.message),
	});
	return { isUpdating, updateUser };
}
