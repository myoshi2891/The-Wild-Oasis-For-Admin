import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../services/apiAuth";

import type { User } from "@supabase/supabase-js";

/**
 * Exposes the current user, loading state, and whether the user is authenticated.
 *
 * @returns An object containing:
 * - `isLoading`: `true` while user data is being fetched, `false` otherwise.
 * - `user`: the fetched `User` object, `null`, or `undefined`.
 * - `isAuthenticated`: `true` if `user?.role === "authenticated"`, `false` otherwise.
 */
export function useUser(): { isLoading: boolean; user: User | null | undefined; isAuthenticated: boolean } {
	const { isLoading, data: user } = useQuery({
		queryKey: ["user"],
		queryFn: getCurrentUser,
	});

	return { isLoading, user, isAuthenticated: user?.role === "authenticated" };
}
