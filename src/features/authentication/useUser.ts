import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../services/apiAuth";

import type { User } from "@supabase/supabase-js";

export function useUser(): { isLoading: boolean; user: User | null | undefined; isAuthenticated: boolean } {
	const { isLoading, data: user } = useQuery({
		queryKey: ["user"],
		queryFn: getCurrentUser,
	});

	return { isLoading, user, isAuthenticated: user?.role === "authenticated" };
}
