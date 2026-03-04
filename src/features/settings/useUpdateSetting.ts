import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateSetting as updateSettingApi } from "../../services/apiSettings";

/**
 * Exposes a mutation hook for updating an application setting.
 *
 * On success, displays a success toast and invalidates the "settings" query; on error, displays an error toast.
 *
 * @returns An object with:
 * - `isUpdating` — `true` while the update is in progress.
 * - `updateSetting` — function to trigger the setting update.
 */
export function useUpdateSetting() {
	const queryClient = useQueryClient();
	const { mutate: updateSetting, isLoading: isUpdating } = useMutation({
		mutationFn: updateSettingApi,
		onSuccess: () => {
			toast.success("Setting successfully edited.");
			queryClient.invalidateQueries({ queryKey: ["settings"] });
		},
		onError: (err: Error) => toast.error(err.message),
	});
	return { isUpdating, updateSetting };
}
