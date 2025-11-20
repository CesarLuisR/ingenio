import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import * as XLSX from "xlsx";
import {
    type Maintenance,
    type Machine,
    type Technician,
    type Failure,
} from "../../../types";
import { findByName, parseHumanDate, normalize } from "../utils";
import { useSessionStore } from "../../../store/sessionStore";

// Definimos la estructura del reporte
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
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [failures, setFailures] = useState<Failure[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Edición
    const [editing, setEditing] = useState<Maintenance | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Importación (ESTADO ACTUALIZADO)
    const [showImport, setShowImport] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importReport, setImportReport] = useState<ImportReport | null>(null); // Nuevo estado estructurado

    // Filtros ... (Igual que antes)
    const [filterMachineId, setFilterMachineId] = useState("");
    const [filterTechnicianId, setFilterTechnicianId] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterHasFailures, setFilterHasFailures] = useState("");
    const [filterText, setFilterText] = useState("");

    const user = useSessionStore((s) => s.user);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = async () => {
        // ... (Igual que antes)
        try {
            const [maintenancesData, machinesData, techData, failuresData] =
                await Promise.all([
                    api.getMaintenances(),
                    api.getMachines(),
                    api.getTechnicians(),
                    api.getFailures?.() ?? Promise.resolve([]),
                ]);

            setMaintenances(maintenancesData);
            setMachines(machinesData);
            setTechnicians(techData);
            setFailures(failuresData);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (maintenance: Maintenance | null) => {
        setEditing(maintenance);
        setShowForm(true);
    };

    const handleImportExcel = async (file: File) => {
        setImportReport(null); // Limpiar reporte previo
        setImporting(true);

        try {
            if (!user) throw new Error("Usuario no autenticado");

            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet) as any[];

            const logs: ImportLog[] = [];
            let successCount = 0;
            let failedCount = 0;

            for (let index = 0; index < rows.length; index++) {
                const row = rows[index];
                const rowNum = index + 2; // +2 porque index 0 es fila 2 en Excel (fila 1 es header)

                try {
                    const machineName = row.machine || row.machineName;
                    const type = row.type as Maintenance["type"];
                    const technicianName = row.technician;
                    const notes = row.notes || undefined;
                    const durationMinutes = row.durationMinutes != null ? Number(row.durationMinutes) : undefined;
                    const cost = row.cost != null ? Number(row.cost) : undefined;
                    const performedAtRaw = row.performedAt;

                    const machine = findByName(machines, machineName);
                    
                    // Validaciones
                    if (!machine) throw new Error(`Máquina "${machineName}" no encontrada`);
                    if (!type) throw new Error("Tipo de mantenimiento inválido o faltante");
                    if (durationMinutes != null && durationMinutes < 0) throw new Error("Duración negativa");
                    if (cost != null && cost < 0) throw new Error("Costo negativo");

                    const technician = technicianName ? findByName(technicians, technicianName) : null;
                    const parsedDate = parseHumanDate(performedAtRaw) || new Date();

                    const payload = {
                        machineId: machine.id,
                        type,
                        technicianId: technician?.id,
                        notes,
                        performedAt: parsedDate.toISOString(),
                        durationMinutes,
                        cost,
                        ingenioId: user.ingenioId!,
                    };

                    await api.createMaintenance(payload);
                    
                    successCount++;
                    logs.push({ row: rowNum, status: "success", message: "Importado correctamente", data: row });

                } catch (err: any) {
                    failedCount++;
                    logs.push({ 
                        row: rowNum, 
                        status: "error", 
                        message: err.message || "Error desconocido", 
                        data: row 
                    });
                }
            }

            await loadData();

            // Guardamos el reporte estructurado
            setImportReport({
                total: rows.length,
                success: successCount,
                failed: failedCount,
                logs: logs
            });

            setShowImport(false); // Cerramos el modal automáticamente al terminar
        } catch (err: any) {
            console.error("Error importando:", err);
            // Si falla todo el proceso (ej: archivo corrupto), creamos un reporte de error global
            setImportReport({
                total: 0,
                success: 0,
                failed: 0,
                logs: [{ row: 0, status: 'error', message: `Error crítico de archivo: ${err.message}` }]
            });
        } finally {
            setImporting(false);
        }
    };

    // ... Lógica de filtrado igual ...
    const filteredMaintenances = maintenances.filter((m) => {
       // ... (Mantener tu lógica de filtros actual)
       const relatedFailures = failures.filter(f => f.machineId === m.machineId || f.maintenanceId === m.id);
       const machine = machines.find(mc => mc.id === m.machineId);
       const tech = m.technician ?? technicians.find(t => t.id === m.technicianId);

       if (filterMachineId && m.machineId.toString() !== filterMachineId) return false;
       if (filterTechnicianId && m.technicianId?.toString() !== filterTechnicianId) return false;
       if (filterType && m.type !== filterType) return false;
       if (filterHasFailures === "yes" && relatedFailures.length === 0) return false;
       if (filterHasFailures === "no" && relatedFailures.length > 0) return false;
       if (filterText) {
           const text = normalize(filterText);
           const haystack = normalize(machine?.name || "") + " " + normalize(machine?.code || "") + " " + normalize(tech?.name || "") + " " + normalize(m.notes || "") + " " + normalize(m.type || "");
           if (!haystack.includes(text)) return false;
       }
       return true;
    });

    return {
        loading,
        machines,
        technicians,
        failures,
        editing,
        showForm,
        handleEdit,
        setShowForm,
        filteredMaintenances,
        loadData,
        
        // Importación
        showImport,
        setShowImport,
        importing,
        importReport,      // <--- Nuevo
        setImportReport,   // <--- Nuevo
        handleImportExcel,
        
        // Filtros
        filterMachineId, setFilterMachineId,
        filterTechnicianId, setFilterTechnicianId,
        filterType, setFilterType,
        filterHasFailures, setFilterHasFailures,
        filterText, setFilterText,
    };
}