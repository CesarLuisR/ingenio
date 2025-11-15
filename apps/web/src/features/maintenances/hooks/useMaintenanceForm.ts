import { useState } from "react";
import type { Maintenance } from "../../../types";
import { api } from "../../../lib/api";
import { safeNumber } from "../utils";
import { useSessionStore } from "../../../store/sessionStore";

export function useMaintenanceForm(initialData: Maintenance | null, onSave: () => void) {
	const user = useSessionStore((s) => s.user);

	const [formData, setFormData] = useState({
		sensorId: initialData?.sensorId?.toString() || "",
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
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.sensorId) newErrors.sensorId = "Selecciona un sensor.";
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
			setFormData((prev) => ({ ...prev, [field]: e.target.value }));

			if (errors[field]) {
				setErrors((prev) => {
					const clone = { ...prev };
					delete clone[field];
					return clone;
				});
			}
		};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		try {
			const payload = {
				sensorId: Number(formData.sensorId),
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

				// 🔥 Aquí se agrega el ingenioId del usuario autenticado
				ingenioId: user?.ingenioId ?? null,
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
		errors,
		handleFieldChange,
		handleSubmit,
	};
}
