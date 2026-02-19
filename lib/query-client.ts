import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 5 * 60 * 1000, // 5 minutos - datos se consideran frescos
				gcTime: 10 * 60 * 1000, // 10 minutos - tiempo antes de garbage collection
				retry: 1, // Reintentos en caso de error
				refetchOnWindowFocus: false, // No refetch automático al volver a la ventana
			},
			mutations: {
				retry: 1,
			},
		},
	});
}
