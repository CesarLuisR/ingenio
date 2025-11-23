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

export function useMachines(selectedIngenioId?: number): UseMachinesResult {
    const { user } = useSessionStore();
    const [machines, setMachines] = useState<MachineWithRelations[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isSuperAdmin = user?.role === ROLES.SUPERADMIN;

    // Determinamos qué ID usar para filtrar (si aplica)
    // Si es SuperAdmin y seleccionó algo -> usa ese ID.
    // Si es SuperAdmin y NO seleccionó nada -> undefined (trae todo).
    // Si NO es SuperAdmin -> usa su propio ingenioId.
    const targetIngenioId = isSuperAdmin ? selectedIngenioId : user?.ingenioId;

    const loadMachines = useCallback(async () => {
        // Si no es superadmin y no tiene ingenio, no cargar nada
        if (!isSuperAdmin && !user?.ingenioId) {
            setMachines([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1) Cargar máquinas (suponemos que getMachines soporta filtrado o trae todas)
            // Si el API no soporta params, traemos todas y filtramos en memoria abajo
            const machinesRaw = await api.getMachines();

            // Filtrado en memoria
            let filtered: MachineWithRelations[] = machinesRaw;

            if (targetIngenioId) {
                filtered = machinesRaw.filter((m) => m.ingenioId === targetIngenioId);
            } else if (!isSuperAdmin) {
                // Seguridad extra: si no es superadmin, forzar filtro aunque targetIngenioId sea null
                filtered = machinesRaw.filter((m) => m.ingenioId === user?.ingenioId);
            }
            // Si es SuperAdmin y targetIngenioId es undefined, mostramos TODAS.

            // 2) Detectar si faltan relaciones
            const needsSensors = filtered.some((m) => m.sensors == null);
            const needsMaintenances = filtered.some((m) => m.maintenances == null);
            const needsFailures = filtered.some((m) => m.failures == null);

            let sensorsByMachine: Record<number, Sensor[]> = {};
            let maintsByMachine: Record<number, Maintenance[]> = {};
            let failuresByMachine: Record<number, Failure[]> = {};

            // 3) Si faltan, llamar a los endpoints y filtrar
            if (needsSensors) {
                const allSensors = await api.getSensors();
                // Filtramos sensores que coincidan con las máquinas visibles
                const visibleMachineIds = new Set(filtered.map(m => m.id));
                
                const relevantSensors = allSensors.filter(s => 
                    s.machineId && visibleMachineIds.has(s.machineId)
                );

                for (const sensor of relevantSensors) {
                    if (!sensor.machineId) continue;
                    if (!sensorsByMachine[sensor.machineId]) {
                        sensorsByMachine[sensor.machineId] = [];
                    }
                    sensorsByMachine[sensor.machineId].push(sensor);
                }
            }

            if (needsMaintenances) {
                const allMaints = await api.getMaintenances();
                const visibleMachineIds = new Set(filtered.map(m => m.id));

                const relevantMaints = allMaints.filter(m => 
                    m.machineId && visibleMachineIds.has(m.machineId)
                );

                for (const mt of relevantMaints) {
                    if (!mt.machineId) continue;
                    if (!maintsByMachine[mt.machineId]) {
                        maintsByMachine[mt.machineId] = [];
                    }
                    maintsByMachine[mt.machineId].push(mt);
                }
            }

            if (needsFailures) {
                const allFails = await api.getFailures();
                const visibleMachineIds = new Set(filtered.map(m => m.id));

                const relevantFails = allFails.filter(f => 
                    f.machineId && visibleMachineIds.has(f.machineId)
                );

                for (const f of relevantFails) {
                    if (!f.machineId) continue;
                    if (!failuresByMachine[f.machineId]) {
                        failuresByMachine[f.machineId] = [];
                    }
                    failuresByMachine[f.machineId].push(f);
                }
            }

            // 4) Enriquecer máquinas
            filtered = filtered.map((m) => ({
                ...m,
                sensors: m.sensors ?? sensorsByMachine[m.id] ?? [],
                maintenances: m.maintenances ?? maintsByMachine[m.id] ?? [],
                failures: m.failures ?? failuresByMachine[m.id] ?? [],
            }));

            setMachines(filtered);
        } catch (e: any) {
            console.error("Error loading machines", e);
            setError(e.message || "Error al cargar máquinas");
        } finally {
            setLoading(false);
        }
    }, [user?.ingenioId, isSuperAdmin, targetIngenioId]);

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