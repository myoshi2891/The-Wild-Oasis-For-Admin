import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createEditCabin, type CreateEditCabinData } from "../../services/apiCabins";

interface EditCabinParams {
	newCabinData: CreateEditCabinData;
	id: number;
}

/**
 * Provides a mutation hook to edit a cabin and keep cabin data in sync.
 *
 * The mutation calls the backend to update a cabin, shows a success or error toast,
 * and invalidates the "cabins" query so fresh data is refetched.
 *
 * @returns An object with:
 * - `isEditing` — `true` while the edit mutation is in progress, `false` otherwise.
 * - `editCabin` — a function accepting `{ newCabinData, id }` to trigger the edit operation.
 */
export function useEditCabin() {
	const queryClient = useQueryClient();
	const { mutate: editCabin, isLoading: isEditing } = useMutation({
		mutationFn: ({ newCabinData, id }: EditCabinParams) =>
			createEditCabin(newCabinData, id),
		onSuccess: () => {
			toast.success("Cabin successfully edited.");
			queryClient.invalidateQueries({ queryKey: ["cabins"] });
		},
		onError: (err: Error) => toast.error(err.message),
	});
	return { isEditing, editCabin };
}
