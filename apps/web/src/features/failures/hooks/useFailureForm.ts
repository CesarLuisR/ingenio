import { useState } from "react";
import type { Failure } from "../../../types";
import { api } from "../../../lib/api";

export default function useFailureForm(
    initialData: Failure | null | undefined,
    onSave: () => void
) {
    const [formData, setFormData] = useState({
        sensorId: initialData?.sensorId?.toString() || "",
        description: initialData?.description || "",
        severity: initialData?.severity || "Media",
        status: initialData?.status || "pendiente",
        resolvedAt: initialData?.resolvedAt || "",
    });

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            sensorId: Number(formData.sensorId),
            description: formData.description,
            severity: formData.severity,
            status: formData.status,
            occurredAt: initialData
                ? initialData.occurredAt
                : new Date().toISOString(),
            resolvedAt:
                formData.status === "resuelta" ? new Date().toISOString() : null,
        };

        try {
            if (initialData) {
                await api.updateFailure(initialData.id.toString(), payload);
            } else {
                await api.createFailure(payload);
            }
            onSave();
        } catch (err) {
            console.error("Error guardando falla:", err);
        }
    };

    return {
        formData,
        updateField,
        handleSubmit,
    };
}
