import { useState } from "react";
import type React from "react";
import type { Maintenance, Failure } from "../../../types";
import { api } from "../../../lib/api";
import { safeNumber } from "../utils";
import { useSessionStore } from "../../../store/sessionStore";

// Extendemos el tipo Maintenance para el hook
type MaintenanceWithFailures = Maintenance & { failures?: Failure[] };

export function useMaintenanceForm(initialData: MaintenanceWithFailures | null, onSave: () => void) {
    const user = useSessionStore((s) => s.user);

    const [formData, setFormData] = useState({
        machineId: initialData?.machineId?.toString() || "",
        type: initialData?.type || "Preventivo",
        technicianId: initialData?.technicianId?.toString() || "",
        performedAt: initialData
            ? new Date(initialData.performedAt).toISOString().slice(0, 16)
            : "",
        durationMinutes:
            initialData?.durationMinutes != null
                ? initialData.durationMinutes.toString()
                : "",
        cost: initialData?.cost != null ? initialData.cost.toString() : "",
        notes: initialData?.notes || "",
        // Inicializamos con los IDs de las fallas que ya tiene el mantenimiento
        failureIds: initialData?.failures?.map(f => f.id.toString()) || [] as string[],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.machineId) newErrors.machineId = "Selecciona una máquina.";
        if (!formData.type) newErrors.type = "Selecciona un tipo de mantenimiento.";

        if (formData.durationMinutes) {
            const n = safeNumber(formData.durationMinutes) ?? -1;
            if (n < 0) newErrors.durationMinutes = "La duración no puede ser negativa.";
        }

        if (formData.cost) {
            const n = safeNumber(formData.cost) ?? -1;
            if (n < 0) newErrors.cost = "El costo no puede ser negativo.";
        }

        if (formData.performedAt) {
            const d = new Date(formData.performedAt);
            if (Number.isNaN(d.getTime())) newErrors.performedAt = "Fecha/hora inválida.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFieldChange =
        (field: keyof typeof formData) =>
        (
            e:
                | React.ChangeEvent<HTMLInputElement>
                | React.ChangeEvent<HTMLSelectElement>
                | React.ChangeEvent<HTMLTextAreaElement>,
        ) => {
            const value = e.target.value;
            
            setFormData((prev) => {
                const newData = { ...prev, [field]: value };
                
                // Si cambia la máquina, limpiamos las fallas seleccionadas
                // (Nota: si usas setFormData directamente desde SearchableSelect, 
                // deberás manejar esta lógica en el componente visual o aquí manualmente)
                if (field === "machineId" && value !== prev.machineId) {
                    newData.failureIds = [];
                }
                
                return newData;
            });

            if (errors[field]) {
                setErrors((prev) => {
                    const clone = { ...prev };
                    delete clone[field];
                    return clone;
                });
            }
        };

    const handleFailureToggle = (failureId: string) => {
        setFormData(prev => {
            const currentIds = prev.failureIds;
            if (currentIds.includes(failureId)) {
                return { ...prev, failureIds: currentIds.filter(id => id !== failureId) };
            } else {
                return { ...prev, failureIds: [...currentIds, failureId] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const payload = {
                machineId: Number(formData.machineId),
                type: formData.type as Maintenance["type"],
                technicianId: formData.technicianId
                    ? Number(formData.technicianId)
                    : undefined,
                notes: formData.notes || undefined,
                cost: formData.cost ? Number(formData.cost) : undefined,
                durationMinutes: formData.durationMinutes
                    ? Number(formData.durationMinutes)
                    : undefined,
                performedAt: formData.performedAt
                    ? new Date(formData.performedAt).toISOString()
                    : new Date().toISOString(),
                ingenioId: user?.ingenioId! ?? null,
                failureIds: formData.failureIds.map(Number),
            };

            if (initialData) {
                await api.updateMaintenance(initialData.id.toString(), payload);
            } else {
                await api.createMaintenance(payload);
            }

            onSave();
        } catch (error) {
            console.error("Error guardando mantenimiento:", error);
        }
    };

    return {
        formData,
        setFormData, // <--- IMPORTANTE: Exportamos esto para usarlo con SearchableSelect
        errors,
        handleFieldChange,
        handleFailureToggle,
        handleSubmit,
    };
}