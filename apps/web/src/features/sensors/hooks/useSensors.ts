import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "../../../lib/api";
import type { Sensor, Machine } from "../../../types";

export function useSensors(ingenioId?: number) {
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const loadSensors = useCallback(async () => {
        setLoading(true);
        try {
            const [sensorData, machineData] = await Promise.all([
                api.getSensors(ingenioId),
                api.getMachines(),
            ]);
            setSensors(sensorData);
            setMachines(machineData);
        } catch (error) {
            console.error("Error cargando sensores:", error);
        } finally {
            setLoading(false);
        }
    }, [ingenioId]);

    const deactivateSensor = useCallback(async (sensorId: string) => {
        try {
            await api.deactivateSensor(sensorId);
            // Actualización optimista local
            setSensors((prev) =>
                prev.map((s) =>
                    (s.sensorId ?? String(s.id)) === sensorId ? { ...s, active: false } : s
                )
            );
        } catch (error) {
            console.error("Error desactivando sensor:", error);
        }
    }, []);

    // --- NUEVA FUNCIÓN ---
    const activateSensor = useCallback(async (sensorId: string) => {
        try {
            await api.activateSensor(sensorId);
            // Actualización optimista local
            setSensors((prev) =>
                prev.map((s) =>
                    (s.sensorId ?? String(s.id)) === sensorId ? { ...s, active: true } : s
                )
            );
        } catch (error) {
            console.error("Error activando sensor:", error);
        }
    }, []);

    const sensorsWithMachine = useMemo(() => {
        return sensors.map((s) => {
            const machine = machines.find((m) => m.id === s.machineId) || null;
            return { ...s, machine };
        });
    }, [sensors, machines]);

    const filteredSensors = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return sensorsWithMachine;
        return sensorsWithMachine.filter((s) => {
            const nameMatch = s.name.toLowerCase().includes(term);
            const machineMatch = s.machine?.name.toLowerCase().includes(term) || s.machine?.code?.toLowerCase().includes(term);
            const locationMatch = s.location?.toLowerCase().includes(term);
            return nameMatch || machineMatch || locationMatch;
        });
    }, [sensorsWithMachine, searchTerm]);

    useEffect(() => {
        loadSensors();
    }, [loadSensors]);

    return {
        sensors: sensorsWithMachine,
        machines,
        filteredSensors,
        loading,
        searchTerm,
        setSearchTerm,
        reload: loadSensors,
        deactivateSensor,
        activateSensor, // Exportamos la nueva función
    };
}