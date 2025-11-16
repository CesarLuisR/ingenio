import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import * as XLSX from "xlsx";
import {
    type Maintenance,
    type Sensor,
    type Technician,
    type Failure,
} from "../../../types";
import { findByName, parseHumanDate, normalize } from "../utils";
import { useSessionStore } from "../../../store/sessionStore";

export function useMaintenancesLogic() {
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [failures, setFailures] = useState<Failure[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Maintenance | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Importación
    const [showImport, setShowImport] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState("");
    const [importSummary, setImportSummary] = useState<string | null>(null);

    // Filtros
    const [filterSensorId, setFilterSensorId] = useState("");
    const [filterTechnicianId, setFilterTechnicianId] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterHasFailures, setFilterHasFailures] = useState("");
    const [filterText, setFilterText] = useState("");

    const user = useSessionStore((s) => s.user);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [maintenancesData, sensorsData, techData, failuresData] =
                await Promise.all([
                    api.getMaintenances(),
                    api.getSensors(),
                    api.getTechnicians(),
                    api.getFailures?.() ?? Promise.resolve([]),
                ]);

            setMaintenances(maintenancesData);
            setSensors(sensorsData);
            setTechnicians(techData);
            setFailures(failuresData);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (maintenance: Maintenance) => {
        setEditing(maintenance);
        setShowForm(true);
    };

    // =======================================
    //   IMPORTACIÓN DESDE EXCEL (LOGICA)
    // =======================================
    const handleImportExcel = async (file: File) => {
        setImportError("");
        setImportSummary(null);
        setImporting(true);

        try {
            if (!user) {
                throw new Error("Usuario no autenticado");
            }

            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet) as any[];

            const report: {
                rowIndex: number;
                row: any;
                status: "ok" | "skipped";
                reason?: string;
            }[] = [];

            for (let index = 0; index < rows.length; index++) {
                const row = rows[index];

                try {
                    const sensorName = row.sensor || row.sensorName;
                    const type = row.type as Maintenance["type"];
                    const technicianName = row.technician;
                    const notes = row.notes || undefined;
                    const durationMinutes =
                        row.durationMinutes != null
                            ? Number(row.durationMinutes)
                            : undefined;
                    const cost = row.cost != null ? Number(row.cost) : undefined;
                    const performedAtRaw = row.performedAt;

                    const sensor = findByName(sensors, sensorName);
                    if (!sensor) {
                        report.push({
                            rowIndex: index + 1,
                            row,
                            status: "skipped",
                            reason: "Sensor no encontrado",
                        });
                        continue;
                    }

                    const technician = technicianName
                        ? findByName(technicians, technicianName)
                        : null;

                    if (!type) {
                        report.push({
                            rowIndex: index + 1,
                            row,
                            status: "skipped",
                            reason: "Tipo inválido",
                        });
                        continue;
                    }

                    if (durationMinutes != null && durationMinutes < 0) {
                        report.push({
                            rowIndex: index + 1,
                            row,
                            status: "skipped",
                            reason: "Duración negativa",
                        });
                        continue;
                    }

                    if (cost != null && cost < 0) {
                        report.push({
                            rowIndex: index + 1,
                            row,
                            status: "skipped",
                            reason: "Costo negativo",
                        });
                        continue;
                    }

                    const parsedDate =
                        parseHumanDate(performedAtRaw) || new Date();

                    const payload = {
                        sensorId: sensor.id,
                        type,
                        technicianId: technician?.id,
                        notes,
                        performedAt: parsedDate.toISOString(),
                        durationMinutes,
                        cost,
                        ingenioId: user?.ingenioId,
                    };

                    await api.createMaintenance(payload);

                    report.push({
                        rowIndex: index + 1,
                        row,
                        status: "ok",
                    });
                } catch (err) {
                    report.push({
                        rowIndex: index + 1,
                        row,
                        status: "skipped",
                        reason: "Error creando mantenimiento",
                    });
                }
            }

            await loadData();

            const ok = report.filter((r) => r.status === "ok").length;
            const skipped = report.filter((r) => r.status === "skipped").length;

            const details = report
                .map((r) =>
                    r.status === "ok"
                        ? `✔️ Fila ${r.rowIndex}: importada (${JSON.stringify(
                            r.row,
                        )})`
                        : `❌ Fila ${r.rowIndex}: ignorada (${r.reason}) → ${JSON.stringify(
                            r.row,
                        )}`,
                )
                .join("\n");

            setImportSummary(
                `Importación completada:
                ${ok} filas procesadas correctamente,
                ${skipped} filas ignoradas.

                Detalles:
                ${details}`,
            );

            setShowImport(false);
        } catch (err) {
            console.error("Error importando:", err);
            setImportError("El archivo no tiene el formato esperado.");
        } finally {
            setImporting(false);
        }
    };

    // =======================================
    //            FILTRADO
    // =======================================
    const filteredMaintenances = maintenances.filter((m) => {
        const relatedFailures = failures.filter(
            (f) =>
                (f as any).maintenanceId === m.id ||
                (f as any).sensorId === m.sensorId,
        );

        const sensor = sensors.find((s) => s.id === m.sensorId);
        const tech =
            m.technician ??
            technicians.find((t) => t.id === m.technicianId);

        if (filterSensorId && m.sensorId.toString() !== filterSensorId)
            return false;

        if (
            filterTechnicianId &&
            m.technicianId?.toString() !== filterTechnicianId
        )
            return false;

        if (filterType && m.type !== filterType) return false;

        if (filterHasFailures === "yes" && relatedFailures.length === 0)
            return false;

        if (filterHasFailures === "no" && relatedFailures.length > 0)
            return false;

        if (filterText) {
            const text = normalize(filterText);
            const haystack =
                normalize(sensor?.name || "") +
                " " +
                normalize(tech?.name || "") +
                " " +
                normalize(m.notes || "") +
                " " +
                normalize(m.type || "");

            if (!haystack.includes(text)) return false;
        }

        return true;
    });

    return {
        loading,
        sensors,
        technicians,
        failures,
        editing,
        showForm,
        handleEdit,
        setShowForm,
        filteredMaintenances,
        loadData,

        // importación
        showImport,
        setShowImport,
        importing,
        importError,
        importSummary,
        handleImportExcel,

        // filtros
        filterSensorId,
        setFilterSensorId,
        filterTechnicianId,
        setFilterTechnicianId,
        filterType,
        setFilterType,
        filterHasFailures,
        setFilterHasFailures,
        filterText,
        setFilterText,
    };
}
