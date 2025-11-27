import { useCallback, useEffect, useState } from "react";
import { api } from "../../../lib/api";
import type {
    Machine,
    Sensor,
    Maintenance,
    Failure,
} from "../../../types";
import { useSessionStore } from "../../../store/sessionStore";
import { ROLES } from "../../../types";

/**
 * Tipo extendido para la UI.
 * Asumimos que el backend envía estas relaciones anidadas 
 * (Server-Side Join via Prisma include).
 */
export type MachineWithRelations = Machine & {
    sensors?: Sensor[];
    maintenances?: Maintenance[];
    failures?: Failure[];
};

interface UseMachinesResult {
    machines: MachineWithRelations[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
    setMachines: React.Dispatch<React.SetStateAction<MachineWithRelations[]>>;
}

/**
 * Hook optimizado para cargar máquinas.
 * * CAMBIO IMPORTANTE: 
 * Se eliminó la lógica de "Client-side Joins". Ahora confiamos en que el backend
 * devuelve la estructura completa en una sola petición.
 */
export function useMachines(selectedIngenioId?: number): UseMachinesResult {
    const { user } = useSessionStore();
    
    // Estado local
    const [machines, setMachines] = useState<MachineWithRelations[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isSuperAdmin = user?.role === ROLES.SUPERADMIN;

    // ------------------------------------------------------------------
    // Función de Carga de Datos (Server-Side Approach)
    // ------------------------------------------------------------------
    const loadMachines = useCallback(async () => {
        // 1. Validaciones de Seguridad
        if (!user) return;

        // Si es usuario normal y no tiene contexto de ingenio, abortar.
        if (!isSuperAdmin && !user.ingenioId) {
            setMachines([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 2. Determinación del Filtro (Ingenio ID)
            // - Si es SuperAdmin y seleccionó un ingenio: enviamos ese ID.
            // - Si es SuperAdmin y NO seleccionó: enviamos undefined (Backend trae todas).
            // - Si es Usuario Normal: enviamos undefined (Backend usa req.session.user.ingenioId).
            const idToFetch = isSuperAdmin ? selectedIngenioId : undefined;

            // 3. Petición Única al Backend
            // Ya no llamamos a getSensors, getMaintenances, etc. por separado.
            // El backend debe hacer el JOIN y devolver todo el árbol de datos.
            const data = await api.getMachines(idToFetch);

            // 4. Actualización del Estado
            // Hacemos un cast a MachineWithRelations[] porque sabemos que el objeto
            // en tiempo de ejecución trae los arrays, aunque el tipo base Machine sea estricto.
            setMachines(data as MachineWithRelations[]);

        } catch (e: any) {
            console.error("Error loading machines:", e);
            const errorMsg = e.message || "Error desconocido al cargar máquinas";
            setError(errorMsg);
            
            // Limpiamos datos en caso de error para evitar estados inconsistentes
            setMachines([]); 
        } finally {
            setLoading(false);
        }
    }, [user, isSuperAdmin, selectedIngenioId]);

    // Efecto para cargar datos al montar o cambiar el filtro de ingenio
    useEffect(() => {
        void loadMachines();
    }, [loadMachines]);

    return {
        machines,
        loading,
        error,
        reload: loadMachines,
        setMachines,
    };
}