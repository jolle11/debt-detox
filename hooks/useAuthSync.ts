"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook que sincroniza las queries con los cambios de autenticación
 * Invalida todas las queries cuando el usuario se loguea o desloguea
 */
export function useAuthSync() {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	useEffect(() => {
		// Cuando el estado del usuario cambia, invalidar todas las queries
		if (user) {
			// Usuario logueado: invalidar queries para forzar refetch con nuevas credenciales
			queryClient.invalidateQueries();
		} else {
			// Usuario deslogueado: limpiar todas las queries
			queryClient.clear();
		}
	}, [user?.id, queryClient]); // Solo reaccionar cuando cambia el ID del usuario
}