import { queryOptions } from "@tanstack/react-query";
import { api } from "../api/client";
import type { UserDto } from "../api/types";
import { isLoggedIn } from "./token-storage";

export const meQueryOptions = queryOptions({
	queryKey: ["auth", "me"] as const,
	queryFn: async (): Promise<UserDto> => {
		if (!isLoggedIn()) throw new Error("Not authenticated");
		const { data, response } = await api.GET("/api/auth/me");
		if (!response.ok) throw new Error(`me failed: ${response.status}`);
		return data as UserDto;
	},
	retry: false,
	staleTime: 5 * 60 * 1000,
});
