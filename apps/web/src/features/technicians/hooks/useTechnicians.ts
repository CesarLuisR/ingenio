import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import type { Technician } from "../../../types";

const normalize = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export default function useTechnicians() {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);

    const [editing, setEditing] = useState<Technician | null>(null);
    const [showForm, setShowForm] = useState(false);

    // filtros
    const [filterStatus, setFilterStatus] = useState(""); // activo / inactivo
    const [filterText, setFilterText] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await api.getTechnicians();
            setTechnicians(data);
        } catch (err) {
            console.error("Error cargando técnicos:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTechnicians = technicians.filter((t) => {
        if (filterStatus) {
            const isActive = t.active ? "activo" : "inactivo";
            if (isActive !== filterStatus) return false;
        }

        if (filterText) {
            const tText =
                normalize(t.name) +
                " " +
                normalize(t.email || "") +
                " " +
                normalize(t.phone || "");

            if (!tText.includes(normalize(filterText))) return false;
        }

        return true;
    });

    return {
        technicians,
        loading,
        editing,
        setEditing,
        showForm,
        setShowForm,

        // filtros
        filterStatus,
        setFilterStatus,
        filterText,
        setFilterText,

        filteredTechnicians,
        loadData,
    };
}
