import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEditCabin, type CreateEditCabinData } from "../../services/apiCabins";
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

	const { mutate: createCabin, isPending: isCreating } = useMutation({
		// React Query v5 では mutationFn が第2引数に context を渡すため、
		// createEditCabin(newCabin, id?) の id に context が混入しないよう明示的にラップする
		// （直接渡すと新規作成が編集として実行されるバグになる）
		mutationFn: (newCabin: CreateEditCabinData) => createEditCabin(newCabin),
		onSuccess: () => {
			toast.success("New cabin successfully created.");
			queryClient.invalidateQueries({ queryKey: ["cabins"] });
		},
		onError: (err: Error) => toast.error(err.message),
	});

	return { isCreating, createCabin };
}
