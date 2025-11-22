// src/modules/failures/hooks/useFailures.ts
import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "../../../lib/api";
import type { Failure, Machine, Sensor } from "../../../types";

// Helper para normalizar texto (fuera del hook para no recrearlo)
const normalize = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export default function useFailures() {
    // --- ESTADOS DE DATOS ---
    const [failures, setFailures] = useState<Failure[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DE UI ---
    const [editing, setEditing] = useState<Failure | null>(null);
    const [showForm, setShowForm] = useState(false);

    // --- ESTADOS DE FILTROS ---
    const [filterMachineId, setFilterMachineId] = useState("");
    const [filterSensorId, setFilterSensorId] = useState("");
    const [filterSeverity, setFilterSeverity] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterText, setFilterText] = useState("");

    // --- CARGA DE DATOS ---
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [failuresData, machinesData, sensorsData] = await Promise.all([
                api.getFailures(),
                api.getMachines(),
                api.getSensors(),
            ]);

            setFailures(failuresData);
            setMachines(machinesData);
            setSensors(sensorsData);
        } catch (err) {
            console.error("Error cargando datos:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar al montar
    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- LÓGICA DE FILTRADO (MEMOIZADA) ---
    const filteredFailures = useMemo(() => {
        return failures.filter((f) => {
            // 1. Filtros exactos
            if (filterMachineId && f.machineId.toString() !== filterMachineId) return false;
            if (filterSensorId && f.sensorId?.toString() !== filterSensorId) return false;
            if (filterSeverity && (f.severity || "") !== filterSeverity) return false;
            if (filterStatus && (f.status || "") !== filterStatus) return false;

            // 2. Filtro de texto (Búsqueda profunda)
            if (filterText) {
                const term = normalize(filterText);
                
                // Buscamos nombres relacionados en memoria para no hacer querys complejos
                const machineName = machines.find((m) => m.id === f.machineId)?.name || "";
                const sensorName = sensors.find((s) => s.id === f.sensorId)?.name || "";
                const description = f.description || "";

                // Creamos un string gigante con todo lo buscable
                const haystack = normalize(`${description} ${machineName} ${sensorName}`);

                if (!haystack.includes(term)) return false;
            }

            return true;
        });
    }, [
        failures, 
        machines, 
        sensors, 
        filterMachineId, 
        filterSensorId, 
        filterSeverity, 
        filterStatus, 
        filterText
    ]);

    return {
        // Datos crudos y procesados
        machines,
        sensors,
        loading,
        filteredFailures,

        // Acciones UI
        editing,
        setEditing,
        showForm,
        setShowForm,
        loadData,

        // Controladores de Filtros
        filterMachineId, setFilterMachineId,
        filterSensorId, setFilterSensorId,
        filterSeverity, setFilterSeverity,
        filterStatus, setFilterStatus,
        filterText, setFilterText,
    };
}