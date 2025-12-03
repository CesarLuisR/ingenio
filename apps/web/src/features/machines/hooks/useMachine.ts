import { useCallback, useEffect, useState, useMemo } from "react";
import { api } from "../../../lib/api";
import type {
    Machine,
    Sensor,
    Maintenance,
    Failure,
} from "../../../types";
import { useSessionStore } from "../../../store/sessionStore";

/**
 * Tipo extendido para la UI.
 */
export type MachineWithRelations = Machine & {
    sensors?: Sensor[];
    maintenances?: Maintenance[];
    failures?: Failure[];
};

// Interfaz para los filtros que recibe el hook
export interface MachineFilters {
    ingenioId?: number;
    search?: string;
    active?: boolean;
    sortBy?: string;
    sortDir?: "asc" | "desc";
}

interface UseMachinesResult {
    // Datos procesados para la vista actual (10 items)
    visibleMachines: MachineWithRelations[];
    
    // Estado
    loading: boolean;
    error: string | null;
    
    // Controles de Paginación UI
    pagination: {
        page: number; // Página actual (1, 2, 3...)
        totalPages: number; // Total de páginas UI
        totalItems: number; // Total de registros en BD
        nextPage: () => void;
        prevPage: () => void;
        canNext: boolean;
        canPrev: boolean;
    };

    // Acciones
    reload: () => Promise<void>;
    // Para actualizaciones optimistas (borrar/editar sin recargar todo)
    setMachines: React.Dispatch<React.SetStateAction<MachineWithRelations[]>>; 
}

/**
 * Hook de Máquinas con Paginación Inteligente (Buffered).
 * Gestiona la sincronización entre la vista (UI_LIMIT) y la red (API_LIMIT).
 */
export function useMachines(filters: MachineFilters): UseMachinesResult {
    const { user } = useSessionStore();
    
    // --- CONSTANTES DE PAGINACIÓN ---
    const API_LIMIT = 50;  // Pedimos bloques grandes al servidor
    const UI_LIMIT = 10;   // Mostramos bloques pequeños al usuario

    // --- ESTADOS DE DATOS ---
    // Buffer: Almacena todos los registros traídos hasta ahora
    const [machinesBuffer, setMachinesBuffer] = useState<MachineWithRelations[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    
    // --- ESTADOS DE CONTROL ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // --- CONTADORES DE PÁGINA ---
    const [apiPage, setApiPage] = useState(1); // Qué página pedir a la API
    const [uiPage, setUiPage] = useState(1);   // Qué página mostrar en pantalla

    const isSuperAdmin = user?.role === "SUPERADMIN";

    // ------------------------------------------------------------------
    // 1. FUNCIÓN DE CARGA (Core Logic)
    // ------------------------------------------------------------------
    const loadMachines = useCallback(async (reset = false) => {
        if (!user) return;

        // Validar permisos básicos
        if (!isSuperAdmin && !user.ingenioId) {
            setMachinesBuffer([]);
            setLoading(false);
            return;
        }

        // Mostrar loading solo si es la primera carga o un reset total
        if (reset || (apiPage === 1 && machinesBuffer.length === 0)) {
            setLoading(true);
        }
        
        setError(null);

        try {
            const pageToFetch = reset ? 1 : apiPage;

            // Construimos params para el backend
            // El backend ya espera: page, limit, search, active, sortBy, sortDir, ingenioId
            const params = {
                page: pageToFetch,
                limit: API_LIMIT,
                ingenioId: isSuperAdmin ? filters.ingenioId : undefined, // Backend usa session si es undefined
                search: filters.search || undefined,
                active: filters.active, // true, false o undefined
                sortBy: filters.sortBy,
                sortDir: filters.sortDir
            };

            const response = await api.machines.getAll(params);

            // Manejo de respuesta (PaginatedResponse)
            const newData = response.data as MachineWithRelations[];
            const total = response.meta.totalItems;

            if (reset) {
                // Si es reset, reemplazamos todo
                setMachinesBuffer(newData);
                setTotalItems(total);
                // Reseteamos contadores
                setUiPage(1);
                setApiPage(1);
            } else {
                // Si es paginación, añadimos al final (evitando duplicados por seguridad)
                setMachinesBuffer(prev => {
                    const existingIds = new Set(prev.map(m => m.id));
                    const uniqueNew = newData.filter(m => !existingIds.has(m.id));
                    return [...prev, ...uniqueNew];
                });
                setTotalItems(total);
            }

        } catch (e: any) {
            console.error("Error loading machines:", e);
            setError(e.message || "Error al cargar máquinas");
            if (reset) setMachinesBuffer([]);
        } finally {
            setLoading(false);
        }
    }, [user, isSuperAdmin, filters, apiPage]);

    // ------------------------------------------------------------------
    // 2. EFECTOS
    // ------------------------------------------------------------------

    // A. Cuando cambian los filtros -> Reset Total
    useEffect(() => {
        // Usamos un timeout debounce o simplemente llamamos al reset
        loadMachines(true);
    }, [
        filters.ingenioId, 
        filters.search, 
        filters.active, 
        filters.sortBy, 
        filters.sortDir
        // No incluimos loadMachines aquí para evitar ciclos, dependemos de los valores primitivos
    ]); 

    // B. Cuando avanza la página de la API -> Carga Incremental (Append)
    useEffect(() => {
        if (apiPage > 1) {
            loadMachines(false);
        }
    }, [apiPage]); // Solo cuando apiPage cambia explícitamente

    // ------------------------------------------------------------------
    // 3. CÁLCULO VISUAL (Slicing)
    // ------------------------------------------------------------------
    const startIndex = (uiPage - 1) * UI_LIMIT;
    const endIndex = startIndex + UI_LIMIT;
    
    // Estos son los 10 items que ve el usuario
    const visibleMachines = useMemo(() => 
        machinesBuffer.slice(startIndex, endIndex), 
    [machinesBuffer, startIndex, endIndex]);

    // ------------------------------------------------------------------
    // 4. DETECTOR DE FIN DE BÚFER (Trigger Automático)
    // ------------------------------------------------------------------
    useEffect(() => {
        const bufferIsRunningLow = endIndex >= machinesBuffer.length;
        const hasMoreOnServer = machinesBuffer.length < totalItems;
        const isInitialized = machinesBuffer.length > 0;

        if (bufferIsRunningLow && hasMoreOnServer && isInitialized && !loading) {
            // "Estamos viendo los últimos items del buffer, pide más al servidor"
            setApiPage(prev => prev + 1);
        }
    }, [uiPage, machinesBuffer.length, totalItems, endIndex, loading]);

    // ------------------------------------------------------------------
    // 5. RETORNO
    // ------------------------------------------------------------------
    
    const totalUiPages = Math.ceil(totalItems / UI_LIMIT);

    return {
        visibleMachines, 
        loading,
        error,
        reload: () => loadMachines(true),
        setMachines: setMachinesBuffer, 
        
        pagination: {
            page: uiPage,
            totalPages: totalUiPages || 1,
            totalItems,
            
            nextPage: () => {
                if (uiPage < totalUiPages) setUiPage(p => p + 1);
            },
            prevPage: () => {
                if (uiPage > 1) setUiPage(p => p - 1);
            },
            canNext: uiPage < totalUiPages,
            canPrev: uiPage > 1
        }
    };
}