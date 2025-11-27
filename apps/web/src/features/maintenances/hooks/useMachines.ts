import { useCallback, useEffect, useState } from "react";
import { api } from "../../../lib/api";
import type { Machine } from "../../../types";
import { useSessionStore } from "../../../store/sessionStore";
import { ROLES } from "../../../types";

// Extendemos el tipo por si tu backend devuelve relaciones, 
// aunque para el dropdown básico 'Machine' es suficiente.
export type MachineWithRelations = Machine;

interface UseMachinesResult {
    machines: MachineWithRelations[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

export function useMachines(selectedIngenioId?: number): UseMachinesResult {
    const { user } = useSessionStore();
    const [machines, setMachines] = useState<MachineWithRelations[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isSuperAdmin = user?.role === ROLES.SUPERADMIN;

    const loadMachines = useCallback(async () => {
        if (!user) return;

        // Si no es admin y no tiene ingenio, no cargamos nada
        if (!isSuperAdmin && !user.ingenioId) {
            setMachines([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Preparamos el ID para filtrar:
            // - Si es SuperAdmin y seleccionó uno -> usamos ese.
            // - Si es SuperAdmin y NO seleccionó -> undefined (trae todas).
            // - Si es Usuario normal -> undefined (el backend usa su cookie de sesión).
            let idToSend: number | undefined = undefined;

            if (isSuperAdmin) {
                if (selectedIngenioId) {
                    idToSend = selectedIngenioId;
                }
            } 
            
            // Llamada a la API
            const data = await api.getMachines({ ingenioId: idToSend });
            
            setMachines(data);

        } catch (e: any) {
            console.error("Error cargando máquinas:", e);
            setError(e.message || "Error al cargar máquinas");
            setMachines([]);
        } finally {
            setLoading(false);
        }
    }, [user, isSuperAdmin, selectedIngenioId]);

    useEffect(() => {
        void loadMachines();
    }, [loadMachines]);

    return {
        machines,
        loading,
        error,
        reload: loadMachines,
    };
}