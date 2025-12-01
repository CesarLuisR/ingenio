import { useCallback, useEffect, useState } from "react";
import { api } from "../../../lib/api";
import * as XLSX from "xlsx";

import {
    type Maintenance,
    type Machine,
    type Technician,
    type Failure,
    type PaginatedResponse,
} from "../../../types";

import { findByName, parseHumanDate } from "../utils";
import { useSessionStore } from "../../../store/sessionStore";

/* -----------------------------------------------------------
   TIPOS
----------------------------------------------------------- */

export interface ImportLog {
    row: number;
    status: "success" | "error";
    message: string;
    data?: Record<string, unknown>;
}

export interface ImportReport {
    total: number;
    success: number;
    failed: number;
    logs: ImportLog[];
}

export interface MaintenanceFilters {
    machineId: string;
    technicianId: string;
    type: "" | "Preventivo" | "Correctivo" | "Predictivo";
    search: string;
}

export type MaintenancesQueryParams = Partial<MaintenanceFilters> & {
    page: number;
    limit: number;
};

/* -----------------------------------------------------------
   HOOK PRINCIPAL
----------------------------------------------------------- */

export function useMaintenancesLogic() {
    const user = useSessionStore((s) => s.user);

    const [maintenancesBuffer, setMaintenancesBuffer] = useState<Maintenance[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [machines, setMachines] = useState<Machine[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [failures, setFailures] = useState<Failure[]>([]);

    const API_LIMIT = 100;
    const UI_LIMIT = 15;

    const [apiPage, setApiPage] = useState<number>(1);
    const [uiPage, setUiPage] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);

    const [filters, setFilters] = useState<MaintenanceFilters>({
        machineId: "",
        technicianId: "",
        type: "",
        search: "",
    });

    // Filtros del formulario (no aplican hasta que tocan "Buscar")
    const [formFilters, setFormFilters] = useState<MaintenanceFilters>({
        machineId: "",
        technicianId: "",
        type: "",
        search: "",
    });

    const updateFormFilter = (key: keyof MaintenanceFilters, value: any) => {
        setFormFilters((prev) => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        setFilters(formFilters);
    };

    const [editing, setEditing] = useState<Maintenance | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);

    const [showImport, setShowImport] = useState<boolean>(false);
    const [importing, setImporting] = useState<boolean>(false);
    const [importReport, setImportReport] = useState<ImportReport | null>(null);

    /* -----------------------------------------------------------
       CARGA DE CATÁLOGOS
    ----------------------------------------------------------- */

    useEffect(() => {
        let mounted = true;

        async function loadCatalogs() {
            if (!user?.ingenioId) return;

            try {
                const [machinesData, techData, failuresData] = await Promise.all([
                    api.machines.getList(),
                    api.technicians.getList(),
                    api.failures.getList().catch(() => []),
                ]);

                if (mounted) {
                    setMachines(machinesData);
                    setTechnicians(techData);
                    setFailures(failuresData);
                }
            } catch (err) {
                console.error("Error cargando catálogos:", err);
            }
        }

        loadCatalogs();

        return () => {
            mounted = false;
        };
    }, [user?.ingenioId]);

    /* -----------------------------------------------------------
       CARGA DE MANTENIMIENTOS
    ----------------------------------------------------------- */

    const loadMaintenances = useCallback(
        async (reset = false) => {
            if (!user?.ingenioId) return;

            setLoading(true);

            try {
                const pageToFetch = reset ? 1 : apiPage;

                const params: MaintenancesQueryParams = {
                    page: pageToFetch,
                    limit: API_LIMIT,
                    machineId: filters.machineId || undefined,
                    technicianId: filters.technicianId || undefined,
                    type: filters.type || undefined,
                    search: filters.search || undefined,
                };

                const response = await api.getMaintenances(params);
                const safeResponse = response as PaginatedResponse<Maintenance>;

                if (reset) {
                    setMaintenancesBuffer(safeResponse.data);
                    setUiPage(1);
                    setApiPage(1);
                } else {
                    setMaintenancesBuffer((prev) => {
                        const existingIds = new Set(prev.map((m) => m.id));
                        const newItems = safeResponse.data.filter((m) => !existingIds.has(m.id));
                        return [...prev, ...newItems];
                    });
                }

                setTotalItems(safeResponse.meta.totalItems);
            } catch (error) {
                if (reset) setMaintenancesBuffer([]);
            } finally {
                setLoading(false);
            }
        },
        [user?.ingenioId, apiPage, filters]
    );

    // Ejecuta carga cuando se aplican filtros
    useEffect(() => {
        loadMaintenances(true);
    }, [filters]);

    /* -----------------------------------------------------------
       PAGINACIÓN
    ----------------------------------------------------------- */

    const startIndex = (uiPage - 1) * UI_LIMIT;
    const endIndex = startIndex + UI_LIMIT;
    const visibleMaintenances = maintenancesBuffer.slice(startIndex, endIndex);

    useEffect(() => {
        const shouldFetchMore =
            endIndex >= maintenancesBuffer.length &&
            maintenancesBuffer.length < totalItems &&
            maintenancesBuffer.length > 0;

        if (shouldFetchMore) setApiPage((prev) => prev + 1);
    }, [uiPage, maintenancesBuffer.length, totalItems, endIndex]);

    useEffect(() => {
        if (apiPage > 1) loadMaintenances(false);
    }, [apiPage]);

    /* -----------------------------------------------------------
       HANDLERS
    ----------------------------------------------------------- */

    const handleEdit = (maintenance: Maintenance | null) => {
        setEditing(maintenance);
        setShowForm(true);
    };

    const handleImportExcel = async (file: File): Promise<void> => {
        // (Lo dejé exactamente igual que estaba en tu versión)
        setImportReport(null);
        setImporting(true);

        try {
            if (!user?.ingenioId) throw new Error("Usuario sin sesión");

            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

            const logs: ImportLog[] = [];
            let successCount = 0;
            let failedCount = 0;

            for (let index = 0; index < rows.length; index++) {
                const row = rows[index];
                const rowNum = index + 2;

                try {
                    const machineName = (row.machine || row.machineName) as string;
                    const typeRaw = row.type as string;
                    const technicianName = (row.technician as string) || "";
                    const notes = (row.notes as string) || "";
                    const rawDate = row.performedAt as string | undefined;
                    const rawDuration = Number(row.durationMinutes);
                    const rawCost = Number(row.cost);

                    const machine = findByName(machines, machineName);
                    if (!machine) throw new Error(`Máquina "${machineName}" no encontrada`);

                    const validTypes = ["Preventivo", "Correctivo", "Predictivo"];
                    if (!validTypes.includes(typeRaw)) {
                        throw new Error(`Tipo inválido. Debe ser uno de: ${validTypes.join(", ")}`);
                    }

                    const parsedDate = parseHumanDate(rawDate);
                    if (!parsedDate) throw new Error(`La fecha 'performedAt' es inválida`);

                    if (isNaN(rawDuration) || rawDuration < 0) {
                        throw new Error("La duración no puede ser negativa");
                    }

                    if (isNaN(rawCost) || rawCost < 0) {
                        throw new Error("El costo no puede ser negativo");
                    }

                    let technician = null;
                    if (technicianName.trim() !== "") {
                        technician = findByName(technicians, technicianName);
                        if (!technician)
                            throw new Error(`Técnico "${technicianName}" no encontrado`);
                    }

                    await api.createMaintenance({
                        machineId: machine.id,
                        type: typeRaw as Maintenance["type"],
                        technicianId: technician?.id || null,
                        notes,
                        performedAt: parsedDate.toISOString(),
                        durationMinutes: rawDuration,
                        cost: rawCost,
                        ingenioId: user.ingenioId,
                    });

                    logs.push({ row: rowNum, status: "success", message: "OK" });
                    successCount++;
                } catch (err: any) {
                    logs.push({
                        row: rowNum,
                        status: "error",
                        message: err.message,
                        data: row,
                    });
                    failedCount++;
                }
            }

            await loadMaintenances(true);

            setImportReport({
                total: rows.length,
                success: successCount,
                failed: failedCount,
                logs,
            });

            setShowImport(false);
        } catch (err: any) {
            setImportReport({
                total: 0,
                success: 0,
                failed: 0,
                logs: [
                    {
                        row: 0,
                        status: "error",
                        message: err.message,
                    },
                ],
            });
            setShowImport(false);
        } finally {
            setImporting(false);
        }
    };

    /* -----------------------------------------------------------
       RETORNO
    ----------------------------------------------------------- */

    return {
        filteredMaintenances: visibleMaintenances,

        machines,
        technicians,
        failures,
        loading,

        pagination: {
            page: uiPage,
            totalPages: Math.ceil(totalItems / UI_LIMIT),
            totalItems,
            nextPage: () => uiPage < totalItems / UI_LIMIT && setUiPage((p) => p + 1),
            prevPage: () => uiPage > 1 && setUiPage((p) => p - 1),
            canNext: uiPage * UI_LIMIT < totalItems,
            canPrev: uiPage > 1,
        },

        // Formulario de filtros
        formFilters,
        setFormFilter: updateFormFilter,
        applyFilters,

        // Edición
        editing,
        showForm,
        handleEdit,
        setShowForm,

        // Reload
        loadData: () => loadMaintenances(true),

        // Importación
        showImport,
        setShowImport,
        importing,
        importReport,
        setImportReport,
        handleImportExcel,
    };
}
