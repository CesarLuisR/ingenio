import { useEffect, useState, useCallback } from "react";
import { api } from "../../../lib/api";
import type { Technician } from "../../../types";

// Definimos la interfaz de la meta-data de paginación
interface PaginationMeta {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export default function useTechnicians() {
    // --- DATOS ---
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);

    // --- PAGINACIÓN ---
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<PaginationMeta>({
        totalItems: 0, totalPages: 0, currentPage: 1, itemsPerPage: 10, hasNextPage: false, hasPreviousPage: false
    });

    // --- ESTADOS UI ---
    const [editing, setEditing] = useState<Technician | null>(null);
    const [showForm, setShowForm] = useState(false);

    // --- FILTROS ---
    const [filterStatus, setFilterStatus] = useState(""); // "activo" | "inactivo" | ""
    const [filterText, setFilterText] = useState("");

    // --- FETCH DATA (Server Side) ---
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Construimos params dinámicos
            const params: Record<string, any> = {
                page,
                limit: 9, // Ajustado a 9 para que se vea bien en grid de 3x3
                search: filterText,
            };

            // Mapeo del filtro de estado para el backend (boolean)
            if (filterStatus === "activo") params.active = true;
            if (filterStatus === "inactivo") params.active = false;

            // Llamada a la API paginada
            const response = await api.technicians.getAll(params);

            setTechnicians(response.data);
            setMeta(response.meta);
        } catch (err) {
            console.error("Error cargando técnicos:", err);
        } finally {
            setLoading(false);
        }
    }, [page, filterText, filterStatus]);

    // --- DEBOUNCE (Retraso en búsqueda) ---
    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, 500); // Espera 500ms al escribir
        return () => clearTimeout(timer);
    }, [loadData]);

    // --- RESET PAGINA ---
    // Si cambian los filtros, volver a pág 1
    useEffect(() => {
        setPage(1);
    }, [filterText, filterStatus]);

    return {
        technicians,
        loading,
        meta, // Exportamos la meta info
        page,
        setPage,

        editing,
        setEditing,
        showForm,
        setShowForm,

        // filtros
        filterStatus,
        setFilterStatus,
        filterText,
        setFilterText,

        refresh: loadData, // Función para recargar manualmente (ej: tras eliminar)
    };
}