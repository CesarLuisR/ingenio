import { useEffect, useState, useCallback } from "react";
import { api } from "../../../lib/api";
import type { User } from "../../../types";
import { useSessionStore } from "../../../store/sessionStore";
import { ROLES } from "../../../types"; // Asegúrate de importar tus roles

interface PaginationMeta {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export default function useUsers(ingenioId?: number) {
    const sessionUser = useSessionStore((s) => s.user);

    // --- DATOS ---
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    
    // --- PAGINACIÓN ---
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<PaginationMeta>({
        totalItems: 0, totalPages: 0, currentPage: 1, itemsPerPage: 10, hasNextPage: false, hasPreviousPage: false
    });

    // --- FILTROS ---
    const [search, setSearch] = useState("");

    // --- UI ---
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);

    // --- CARGA DE DATOS ---
    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            
            // Construimos los parámetros
            const params: Record<string, any> = {
                page,
                limit: 10,
                search: search, // Filtro por texto (nombre/email)
            };

            // Si hay un ingenio seleccionado (y no es 0/undefined), lo agregamos
            if (ingenioId) {
                params.ingenioId = ingenioId;
            }

            // Usamos el método getAll (paginado)
            const response = await api.users.getAll(params);
            
            setUsers(response.data);
            setMeta(response.meta);

        } catch (err) {
            console.error("Error cargando usuarios:", err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [page, ingenioId, search]);

    // --- DEBOUNCE PARA BÚSQUEDA ---
    useEffect(() => {
        const timer = setTimeout(() => {
            loadUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [loadUsers]);

    // Resetear página si cambian los filtros principales
    useEffect(() => {
        setPage(1);
    }, [ingenioId, search]);

    // --- ACCIONES ---
    const deleteUser = async (id: number) => {
        // Validación de permisos más robusta usando el Enum
        if (!sessionUser || (sessionUser.role !== ROLES.ADMIN && sessionUser.role !== ROLES.SUPERADMIN)) {
            alert("No tienes permisos para realizar esta acción");
            return;
        }

        if (!confirm("¿Eliminar usuario permanentemente?")) return;

        try {
            await api.deleteUser(id.toString()); // Asumiendo que esta API existe en tu lib
            // Recargamos la página actual
            loadUsers();
        } catch (err) {
            console.error("Error eliminando usuario:", err);
            alert("Error al eliminar usuario.");
        }
    };

    return {
        users,
        loading,
        meta,       // Data de paginación
        page,
        setPage,
        search,
        setSearch,

        showForm,
        setShowForm,
        editing,
        setEditing,

        refresh: loadUsers,
        deleteUser,
    };
}