import { useState } from "react";
import type { Failure } from "../../../types";
import { api } from "../../../lib/api";
import { useSessionStore } from "../../../store/sessionStore";

export default function useFailureForm(
	initialData: Failure | null,
	onSave: () => void
) {
	const user = useSessionStore((s) => s.user);

	const [formData, setFormData] = useState({
		machineId: initialData?.machineId?.toString() || "",
		sensorId: initialData?.sensorId?.toString() || "",
		description: initialData?.description || "",
		severity: initialData?.severity || "Media",
		status: initialData?.status || "pendiente",
	});

	const updateField = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const payload = {
			machineId: Number(formData.machineId),
			sensorId: formData.sensorId ? Number(formData.sensorId) : null,
			description: formData.description,
			severity: formData.severity,
			status: formData.status,
			occurredAt: initialData
				? initialData.occurredAt
				: new Date().toISOString(),
			resolvedAt:
				formData.status === "resuelta"
					? new Date().toISOString()
					: null,

			ingenioId: user?.ingenioId! ?? null,
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
