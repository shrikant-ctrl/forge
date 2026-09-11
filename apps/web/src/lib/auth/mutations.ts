import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { type ApiError, normalizeError } from "../api/errors";
import type {
	LoginDto,
	RegisterDto,
	TokenResponseDto,
	UserDto,
} from "../api/types";
import { meQueryOptions } from "./queries";
import { clearTokens, getRefreshToken, setTokens } from "./token-storage";

export function useLogin() {
	const queryClient = useQueryClient();
	return useMutation<TokenResponseDto, ApiError, LoginDto>({
		mutationFn: async (body) => {
			const { data, error, response } = await api.POST("/api/auth/login", {
				body,
			});
			if (error) throw await normalizeError(response);
			return data;
		},
		onSuccess: async (tokens) => {
			setTokens(tokens);
			await queryClient.invalidateQueries({
				queryKey: meQueryOptions.queryKey,
			});
		},
	});
}

export function useRegister() {
	return useMutation<UserDto, ApiError, RegisterDto>({
		mutationFn: async (body) => {
			const { data, error, response } = await api.POST("/api/auth/register", {
				body,
			});
			if (error) throw await normalizeError(response);
			return data;
		},
	});
}

export function useLogout() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			const refreshToken = getRefreshToken();
			if (refreshToken) {
				await api
					.POST("/api/auth/logout", { body: { refreshToken } })
					.catch(() => {});
			}
		},
		onSettled: async () => {
			clearTokens();
			queryClient.removeQueries({ queryKey: meQueryOptions.queryKey });
		},
	});
}
