import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteCabin as deleteCabinApi } from "../../services/apiCabins";

/**
 * Provides a mutation for deleting a cabin and manages related UI and cache updates.
 *
 * On success, displays a success toast "Cabin was successfully deleted!" and invalidates the "cabins" query; on error, displays an error toast with the error message.
 *
 * @returns An object with:
 * - `isDeleting` — `true` while the deletion mutation is in progress, `false` otherwise.
 * - `deleteCabin` — function to trigger the deletion mutation; call it with the mutation variables expected by the hook.
 */
export function useDeleteCabin() {
	const queryClient = useQueryClient();

	const { isPending: isDeleting, mutate: deleteCabin } = useMutation({
		mutationFn: deleteCabinApi,
		onSuccess: () => {
			toast.success("Cabin was successfully deleted!");

			queryClient.invalidateQueries({
				queryKey: ["cabins"],
			});
		},
		onError: (err: Error) => toast.error(err.message),
	});

	return { isDeleting, deleteCabin };
}
