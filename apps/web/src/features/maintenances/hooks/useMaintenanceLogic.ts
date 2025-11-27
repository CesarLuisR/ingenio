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

// --- TIPOS DE EXCEL ---
export interface ImportLog {
    row: number;
    status: "success" | "error";
    message: string;
    data?: any;
}

export interface ImportReport {
    total: number;
    success: number;
    failed: number;
    logs: ImportLog[];
}

export function useMaintenancesLogic() {
    const user = useSessionStore((s) => s.user);

    // --- ESTADO DE DATOS (BUFFER) ---
    const [maintenancesBuffer, setMaintenancesBuffer] = useState<Maintenance[]>([]);
    const [loading, setLoading] = useState(true);

    // Catálogos
    const [machines, setMachines] = useState<Machine[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [failures, setFailures] = useState<Failure[]>([]);

    // --- CONFIGURACIÓN DE PAGINACIÓN HÍBRIDA ---
    const API_LIMIT = 100; // La API nos da bloques de 30
    const UI_LIMIT = 15; // Nosotros mostramos de 10 en 10 (configurable)

    const [apiPage, setApiPage] = useState(1); // Página actual del servidor
    const [uiPage, setUiPage] = useState(1); // Página visual del usuario
    const [totalItems, setTotalItems] = useState(0);

    // --- ESTADO DE FILTROS ---
    const [filters, setFilters] = useState({
        machineId: "",
        technicianId: "",
        type: "",
        hasFailures: "",
        search: "",
    });

    // --- ESTADO UI ---
    const [editing, setEditing] = useState<Maintenance | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Importación
    const [showImport, setShowImport] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importReport, setImportReport] = useState<ImportReport | null>(null);

    // =========================================================
    // 1. CARGA INICIAL DE CATÁLOGOS
    // =========================================================
    useEffect(() => {
        let mounted = true;

        async function loadCatalogs() {
            if (!user?.ingenioId) return;

            try {
                const [machinesData, techData, failuresData] = await Promise.all([
                    api.getMachines(),
                    api.getTechnicians(),
                    api.getFailures().catch(() => []),
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

    // =========================================================
    // 2. CARGA DE MANTENIMIENTOS (Lógica Híbrida)
    // =========================================================
    const loadMaintenances = useCallback(
        async (reset = false) => {
            if (!user?.ingenioId) return;

            setLoading(true);
            try {
                const pageToFetch = reset ? 1 : apiPage;

                const params: any = {
                    page: pageToFetch,
                    limit: API_LIMIT,
                    ingenioId: user.ingenioId,
                    ...filters,
                };

                // Limpieza de filtros vacíos
                if (!params.machineId) delete params.machineId;
                if (!params.technicianId) delete params.technicianId;
                if (!params.type) delete params.type;
                if (!params.search) delete params.search;
                if (!params.hasFailures) delete params.hasFailures;

                const response = await api.getMaintenances(params);
                const safeResponse = response as unknown as PaginatedResponse<Maintenance>;

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
                console.error("Error cargando mantenimientos:", error);
                if (reset) setMaintenancesBuffer([]);
            } finally {
                setLoading(false);
            }
        },
        [user?.ingenioId, apiPage, filters]
    );

    // Recargar cuando cambian los filtros (Modo Reset)
    useEffect(() => {
        loadMaintenances(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // =========================================================
    // 3. LÓGICA DE VISUALIZACIÓN Y FETCH AUTOMÁTICO
    // =========================================================
    const startIndex = (uiPage - 1) * UI_LIMIT;
    const endIndex = startIndex + UI_LIMIT;
    const visibleMaintenances = maintenancesBuffer.slice(startIndex, endIndex);

    // ¿Necesitamos más datos del servidor?
    useEffect(() => {
        if (
            endIndex >= maintenancesBuffer.length &&
            maintenancesBuffer.length < totalItems &&
            maintenancesBuffer.length > 0
        ) {
            setApiPage((prev) => prev + 1);
        }
    }, [uiPage, maintenancesBuffer.length, totalItems, endIndex]);

    // Escuchar cambios de apiPage (evitar doble carga inicial)
    useEffect(() => {
        if (apiPage > 1) {
            loadMaintenances(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiPage]);

    // =========================================================
    // 4. HANDLERS UI
    // =========================================================
    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleNextPage = () => {
        if (uiPage * UI_LIMIT < totalItems) {
            setUiPage((p) => p + 1);
        }
    };

    const handlePrevPage = () => {
        if (uiPage > 1) {
            setUiPage((p) => p - 1);
        }
    };

    const handleEdit = (maintenance: Maintenance | null) => {
        setEditing(maintenance);
        setShowForm(true);
    };

    // =========================================================
    // 5. IMPORTACIÓN EXCEL
    // =========================================================
    const handleImportExcel = async (file: File) => {
        setImportReport(null);
        setImporting(true);

        try {
            if (!user?.ingenioId) throw new Error("Usuario sin sesión");

            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet) as any[];

            const logs: ImportLog[] = [];
            let successCount = 0;
            let failedCount = 0;

            for (let index = 0; index < rows.length; index++) {
                const row = rows[index];
                const rowNum = index + 2;

                try {
                    const machineName = row.machine || row.machineName;
                    const typeRaw = row.type;
                    const technicianName = row.technician;

                    const machine = findByName(machines, machineName);
                    if (!machine) throw new Error(`Máquina "${machineName}" no encontrada`);

                    const validTypes = ["Preventivo", "Correctivo", "Predictivo"];
                    if (!typeRaw || !validTypes.includes(typeRaw)) throw new Error("Tipo inválido");
                    const type = typeRaw as Maintenance["type"];

                    const technician = technicianName ? findByName(technicians, technicianName) : null;
                    const parsedDate = parseHumanDate(row.performedAt) || new Date();

                    await api.createMaintenance({
                        machineId: machine.id,
                        type,
                        technicianId: technician?.id,
                        notes: row.notes,
                        performedAt: parsedDate.toISOString(),
                        durationMinutes: Number(row.durationMinutes) || 0,
                        cost: Number(row.cost) || 0,
                        ingenioId: user.ingenioId,
                    });

                    successCount++;
                    logs.push({ row: rowNum, status: "success", message: "OK" });
                } catch (err: any) {
                    failedCount++;
                    logs.push({ row: rowNum, status: "error", message: err.message, data: row });
                }
            }

            // Recargamos todo (Reset)
            loadMaintenances(true);

            setImportReport({
                total: rows.length,
                success: successCount,
                failed: failedCount,
                logs,
            });

            setShowImport(false);
        } catch (err: any) {
            console.error("Error crítico importando:", err);
            setImportReport({
                total: 0,
                success: 0,
                failed: 0,
                logs: [
                    {
                        row: 0,
                        status: "error",
                        message: `Error de archivo: ${err.message}`,
                    },
                ],
            });
        } finally {
            setImporting(false);
        }
    };

    return {
        // Datos visibles
        filteredMaintenances: visibleMaintenances,

        machines,
        technicians,
        failures,
        loading,

        // Paginación
        pagination: {
            page: uiPage,
            totalPages: Math.ceil(totalItems / UI_LIMIT),
            totalItems,
            nextPage: handleNextPage,
            prevPage: handlePrevPage,
            canNext: uiPage * UI_LIMIT < totalItems,
            canPrev: uiPage > 1,
        },

        // Filtros (objeto completo + helpers)
        filters,
        filterMachineId: filters.machineId,
        filterTechnicianId: filters.technicianId,
        filterType: filters.type,
        filterHasFailures: filters.hasFailures,
        filterText: filters.search,

        setFilterMachineId: (v: string) => handleFilterChange("machineId", v),
        setFilterTechnicianId: (v: string) => handleFilterChange("technicianId", v),
        setFilterType: (v: string) => handleFilterChange("type", v),
        setFilterHasFailures: (v: string) => handleFilterChange("hasFailures", v),
        setFilterText: (v: string) => handleFilterChange("search", v),

        // UI
        editing,
        showForm,
        handleEdit,
        setShowForm,
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
