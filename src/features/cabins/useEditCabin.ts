import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createEditCabin, type CreateEditCabinData } from "../../services/apiCabins";

interface EditCabinParams {
	newCabinData: CreateEditCabinData;
	id: number;
}

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
