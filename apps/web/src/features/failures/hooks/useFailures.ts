import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import type { Failure, Sensor } from "../../../types";

const normalize = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export default function useFailures() {
    const [failures, setFailures] = useState<Failure[]>([]);
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [loading, setLoading] = useState(true);

    const [editing, setEditing] = useState<Failure | null>(null);
    const [showForm, setShowForm] = useState(false);

    // filtros
    const [filterSensorId, setFilterSensorId] = useState("");
    const [filterSeverity, setFilterSeverity] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterText, setFilterText] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [failuresData, sensorsData] = await Promise.all([
                api.getFailures(),
                api.getSensors(),
            ]);

            setFailures(failuresData);
            setSensors(sensorsData);
        } catch (err) {
            console.error("Error cargando datos:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredFailures = failures.filter((f) => {
        if (filterSensorId && f.sensorId.toString() !== filterSensorId)
            return false;
        if (filterSeverity && (f.severity || "") !== filterSeverity)
            return false;
        if (filterStatus && (f.status || "") !== filterStatus) return false;

        if (filterText) {
            const t = normalize(filterText);
            const haystack =
                normalize(f.description || "") +
                " " +
                normalize(sensors.find((s) => s.id === f.sensorId)?.name || "");

            if (!haystack.includes(t)) return false;
        }

        return true;
    });

    return {
        failures,
        sensors,
        loading,

        filteredFailures,

        editing,
        setEditing,
        showForm,
        setShowForm,

        filterSensorId,
        setFilterSensorId,
        filterSeverity,
        setFilterSeverity,
        filterStatus,
        setFilterStatus,
        filterText,
        setFilterText,

        loadData,
    };
}
