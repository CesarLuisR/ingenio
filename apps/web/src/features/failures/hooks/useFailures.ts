// src/modules/failures/hooks/useFailures.ts
import { useEffect, useState, useCallback } from "react";
import { api } from "../../../lib/api";
import type { Failure, Machine, Sensor } from "../../../types";

// Definimos la estructura de la meta-data que viene del backend
interface PaginationMeta {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export default function useFailures() {
    // --- ESTADOS DE DATOS ---
    const [failures, setFailures] = useState<Failure[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]); // Para los dropdowns
    const [sensors, setSensors] = useState<Sensor[]>([]);   // Para los dropdowns
    
    // --- ESTADO DE PAGINACIÓN ---
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<PaginationMeta>({
        totalItems: 0, totalPages: 0, currentPage: 1, itemsPerPage: 10, hasNextPage: false, hasPreviousPage: false
    });
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

    // --- 1. CARGA DE AUXILIARES (Máquinas/Sensores para Selects) ---
    // Se ejecuta una sola vez al montar
    useEffect(() => {
        const loadAuxData = async () => {
            try {
                // Usamos getList() para traer versiones ligeras sin paginación para los dropdowns
                const [machinesData, sensorsData] = await Promise.all([
                    api.machines.getList({ simple: true }),
                    api.sensors.getList({ simple: true }),
                ]);
                setMachines(machinesData);
                setSensors(sensorsData);
            } catch (err) {
                console.error("Error cargando auxiliares:", err);
            }
        };
        loadAuxData();
    }, []);

    // --- 2. CARGA DE FALLAS (Paginadas y Filtradas) ---
    const fetchFailures = useCallback(async () => {
        setLoading(true);
        try {
            // Construimos los params para el backend
            const params: Record<string, any> = {
                page,
                limit: 10, // Puedes hacerlo dinámico si quieres
                search: filterText,
            };

            if (filterMachineId) params.machineId = filterMachineId;
            if (filterSensorId) params.sensorId = filterSensorId;
            if (filterSeverity) params.severity = filterSeverity;
            if (filterStatus) params.status = filterStatus;

            // Llamada al backend
            const response = await api.failures.getAll(params);
            
            setFailures(response.data);
            setMeta(response.meta);
        } catch (err) {
            console.error("Error cargando fallas:", err);
        } finally {
            setLoading(false);
        }
    }, [page, filterMachineId, filterSensorId, filterSeverity, filterStatus, filterText]);

    // --- DEBOUNCE PARA TEXTO ---
    // Evita llamar a la API por cada letra escrita. Espera 500ms.
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFailures();
        }, 500); // 500ms de delay

        return () => clearTimeout(timer);
    }, [fetchFailures]);

    // Resetear a página 1 si cambian los filtros (excepto si cambia solo la página)
    useEffect(() => {
        setPage(1);
    }, [filterMachineId, filterSensorId, filterSeverity, filterStatus, filterText]);


    return {
        // Datos
        failures, // OJO: Ya son las filtradas del server
        machines,
        sensors,
        loading,
        meta,      // Exportamos la meta para usarla en la UI

        // Paginación
        page,
        setPage,

        // Acciones UI
        editing,
        setEditing,
        showForm,
        setShowForm,
        refresh: fetchFailures,

        // Controladores de Filtros
        filterMachineId, setFilterMachineId,
        filterSensorId, setFilterSensorId,
        filterSeverity, setFilterSeverity,
        filterStatus, setFilterStatus,
        filterText, setFilterText,
    };
}