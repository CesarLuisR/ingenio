import { useCallback, useEffect, useState } from "react";
import { api } from "../../../lib/api";
import type { Machine, Sensor, Maintenance, Failure, BaseMetrics } from "../../../types";
import { useSessionStore } from "../../../store/sessionStore";

export interface MachineDetailData {
    machine: Machine | null;
    sensors: Sensor[];
    maintenances: Maintenance[];
    failures: Failure[];
    metrics: BaseMetrics | null;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

export function useMachineDetail(machineId: number): MachineDetailData {
    const { user } = useSessionStore();

    const [machine, setMachine] = useState<Machine | null>(null);
    
    // Estos estados son derivados de la máquina, pero los mantenemos por compatibilidad de interfaz
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [failures, setFailures] = useState<Failure[]>([]);
    
    const [metrics, setMetrics] = useState<BaseMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        if (!user?.ingenioId) {
            // Permitimos si es SuperAdmin, sino error
            if (user?.role !== 'SUPERADMIN') {
                setError("Contexto de usuario inválido");
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Carga Principal Única
            // Asumimos que el backend hace: prisma.machine.findUnique({ include: { sensors: true, maintenances: true, failures: true } })
            const m = await api.getMachine(machineId);

            if (!m) throw new Error("Máquina no encontrada");

            // Validación de seguridad básica en cliente
            if (user?.role !== 'SUPERADMIN' && m.ingenioId !== user?.ingenioId) {
                throw new Error("No tienes permiso para ver esta máquina");
            }

            setMachine(m);

            // 2. Extraer relaciones (si vienen en el objeto, si no, arrays vacíos)
            // Esto evita tener que hacer peticiones extra.
            setSensors(m.sensors || []);
            setMaintenances(m.maintenances || []);
            setFailures(m.failures || []);

            // 3. Carga de Métricas (Opcional / Paralela)
            // Las métricas suelen ser calculadas, por eso se piden aparte.
            try {
                const metricsData = await api.getMachineMetrics(m.id);
                setMetrics(metricsData);
            } catch (err) {
                console.warn("No se pudieron cargar métricas:", err);
                // No rompemos la página si solo fallan los KPIs
            }

        } catch (e: any) {
            console.error("Error loading machine detail:", e);
            setError(e.message || "Error al cargar datos de la máquina");
            setMachine(null);
        } finally {
            setLoading(false);
        }
    }, [machineId, user?.ingenioId, user?.role]);

    useEffect(() => {
        if (machineId) {
            void reload();
        }
    }, [reload, machineId]);

    return {
        machine,
        sensors,
        maintenances,
        failures,
        metrics,
        loading,
        error,
        reload,
    };
}