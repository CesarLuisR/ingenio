import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "../../../lib/api";
import type { Sensor, Machine } from "../../../types";

export type FilterMode =
    | "all"
    | "active"
    | "inactive"
    | "recent"
    | "disabled"
    | "unconfigured";

interface UseSensorsParams {
    search?: string;
    machineId?: number;
    filterMode?: FilterMode;
}

export function useSensors(ingenioId?: number, params?: UseSensorsParams) {
    const { search, machineId, filterMode } = params || {};

    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);

    // Paginate
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const loadSensors = useCallback(async () => {
        setLoading(true);
        try {
            const query: Record<string, any> = { page, limit };

            if (ingenioId !== undefined) query.ingenioId = ingenioId;
            if (search?.trim()) query.search = search.trim();
            if (typeof machineId === "number") query.machineId = machineId;

            // disabled
            if (filterMode === "disabled") query.active = false;
            else query.active = true;

            if (filterMode === "unconfigured") query.unconfigured = true;

            const [sensorResp, machineData] = await Promise.all([
                api.sensors.getAll(query),
                api.machines.getList(),
            ]);

            setSensors(sensorResp.data);
            setTotalItems(sensorResp.meta.totalItems);
            setTotalPages(sensorResp.meta.totalPages || 1);

            setMachines(machineData);
        } catch (e) {
            console.error("Error loading sensors:", e);
        } finally {
            setLoading(false);
        }
    }, [ingenioId, page, limit, search, machineId, filterMode]);

    useEffect(() => {
        setPage(1);
    }, [ingenioId, search, machineId, filterMode]);

    useEffect(() => {
        loadSensors();
    }, [loadSensors]);

    const deactivateSensor = useCallback(async (id: number) => {
        await api.deactivateSensor(id);
        setSensors((prev) =>
            prev.map((s) => (s.id === id ? { ...s, active: false } : s))
        );
    }, []);

    const activateSensor = useCallback(async (id: number) => {
        await api.activateSensor(id);
        setSensors((prev) =>
            prev.map((s) => (s.id === id ? { ...s, active: true } : s))
        );
    }, []);

    const sensorsWithMachine = useMemo(() => {
        return sensors.map((s) => {
            const machine = machines.find((m) => m.id === s.machineId) || null;
            return { ...s, machine };
        });
    }, [sensors, machines]);

    const filteredSensors = useMemo(() => sensorsWithMachine, [sensorsWithMachine]);

    return {
        sensors: sensorsWithMachine,
        filteredSensors,
        machines,
        loading,
        reload: loadSensors,

        deactivateSensor,
        activateSensor,

        page,
        setPage,
        totalItems,
        totalPages,

        nextPage: () => setPage((p) => (p < totalPages ? p + 1 : p)),
        prevPage: () => setPage((p) => (p > 1 ? p - 1 : p)),
        canNext: page < totalPages,
        canPrev: page > 1,
    };
}
