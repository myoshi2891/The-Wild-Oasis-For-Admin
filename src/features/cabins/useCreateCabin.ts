import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEditCabin } from "../../services/apiCabins";
import toast from "react-hot-toast";

/**
 * Provides a React Query mutation for creating a cabin, displays success/error toasts, and refreshes the "cabins" cache on success.
 *
 * @returns An object containing:
 * - `isCreating` — `true` while the create mutation is in progress, `false` otherwise.
 * - `createCabin` — function to trigger cabin creation; accepts the creation payload to send to the API.
 */
export function useCreateCabin() {
	const queryClient = useQueryClient();

	const { mutate: createCabin, isLoading: isCreating } = useMutation({
		mutationFn: createEditCabin,
		onSuccess: () => {
			toast.success("New cabin successfully created.");
			queryClient.invalidateQueries({ queryKey: ["cabins"] });
		},
		onError: (err: Error) => toast.error(err.message),
	});

	return { isCreating, createCabin };
}
