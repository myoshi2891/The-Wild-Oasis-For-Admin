import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateCurrentUser } from "../../services/apiAuth";

export function useUpdateUser() {
	const queryClient = useQueryClient();

	const { mutate: updateUser, isLoading: isUpdating } = useMutation({
		mutationFn: updateCurrentUser,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onSuccess: (data: any) => {
			toast.success("User account successfully updated.");
			queryClient.setQueryData(["user"], data?.user);
		},
		onError: (err: Error) => toast.error(err.message),
	});
	return { isUpdating, updateUser };
}
