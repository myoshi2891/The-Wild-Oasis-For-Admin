import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateCurrentUser } from "../../services/apiAuth";
import type { User } from "@supabase/supabase-js";

export function useUpdateUser() {
	const queryClient = useQueryClient();

	const { mutate: updateUser, isLoading: isUpdating } = useMutation({
		mutationFn: updateCurrentUser,
		onSuccess: (data: { user: User }) => {
			toast.success("User account successfully updated.");
			if (data?.user) queryClient.setQueryData(["user"], data.user);
		},
		onError: (err: Error) => toast.error(err.message),
	});
	return { isUpdating, updateUser };
}
