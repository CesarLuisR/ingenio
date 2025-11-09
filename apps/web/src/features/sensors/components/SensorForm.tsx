import { useState, useEffect, useCallback } from "react";
import { api } from "../../../lib/api";
import {
	CancelButton,
	FormGroup,
	Input,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
	Select,
	SubmitButton,
	Form,
	Label,
} from "../styled";
import MetricsConfigEditor from "./MetricsConfigEditor";
import type { Sensor } from "../../../types";

export default function SensorForm({
	sensor,
	onClose,
	onSave,
}: {
	sensor: Sensor | null;
	onClose: () => void;
	onSave: () => void;
}) {
	// Config base
	const initialConfig = sensor?.config || {};
	const initialMetrics = initialConfig.metricsConfig || {};
	const sensorId = sensor?.sensorId || initialConfig.sensorId || "";

	const [formData, setFormData] = useState({
		name: sensor?.name || "",
		type: sensor?.type || initialConfig.type || "",
		location: sensor?.location || initialConfig.location || "",
		active: sensor?.active ?? initialConfig.active ?? true,
		intervalMs: initialConfig.intervalMs || 1000,
		metricsConfig: initialMetrics,
	});

	// Cuando cambia el sensor que se edita
	useEffect(() => {
		const baseConfig = sensor?.config || {};
		const baseMetrics = baseConfig.metricsConfig || {};

		setFormData({
			name: sensor?.name || "",
			type: sensor?.type || baseConfig.type || "",
			location: sensor?.location || baseConfig.location || "",
			active: sensor?.active ?? baseConfig.active ?? true,
			intervalMs: baseConfig.intervalMs || 1000,
			metricsConfig: baseMetrics,
		});
	}, [sensor]);

	// Callback para actualizar métricas
	const handleMetricsChange = useCallback((cfg: any) => {
		setFormData((prev) => ({ ...prev, metricsConfig: cfg }));
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const baseConfig = sensor?.config || {};

			// Config consistente con la estructura del sensor físico
			const config = {
				sensorId: sensorId || crypto.randomUUID(), // no editable, pero se respeta el existente
				type: formData.type,
				location: formData.location,
				intervalMs: formData.intervalMs,
				metricsConfig: formData.metricsConfig,
				active: formData.active,
				configVersion: baseConfig.configVersion || "v1",
				createdAt: baseConfig.createdAt || new Date().toISOString(),
				lastSeen: sensor?.lastSeen || null,
			};

			// Payload unificado
			const payload = {
				name: formData.name,
				type: formData.type,
				location: formData.location,
				active: formData.active,
				config,
			};

			if (sensor) {
				await api.updateSensor(sensor.sensorId, payload);
			} else {
				console.error("No se proporcionó sensor para actualizar");
				return;
			}

			onSave();
			onClose();
		} catch (error) {
			console.error("Error guardando sensor:", error);
		}
	};

	return (
		<Modal>
			<ModalContent>
				<ModalTitle>
					{sensor ? "Editar Sensor" : "Nuevo Sensor"}
				</ModalTitle>

				<Form onSubmit={handleSubmit}>
					<FormGroup>
						<Label>Nombre del Sensor</Label>
						<Input
							type="text"
							required
							value={formData.name}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									name: e.target.value,
								}))
							}
						/>
					</FormGroup>

					{sensorId && (
						<FormGroup>
							<Label>ID del Sensor (no editable)</Label>
							<Input type="text" value={sensorId} readOnly />
						</FormGroup>
					)}

					<FormGroup>
						<Label>Tipo</Label>
						<Input
							type="text"
							required
							value={formData.type}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									type: e.target.value,
								}))
							}
						/>
					</FormGroup>

					<FormGroup>
						<Label>Ubicación</Label>
						<Input
							type="text"
							required
							value={formData.location}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									location: e.target.value,
								}))
							}
						/>
					</FormGroup>

					<FormGroup>
						<Label>Estado</Label>
						<Select
							value={formData.active ? "active" : "inactive"}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									active: e.target.value === "active",
								}))
							}>
							<option value="active">Activo</option>
							<option value="inactive">Inactivo</option>
						</Select>
					</FormGroup>

					<FormGroup>
						<Label>Intervalo de Lectura (ms)</Label>
						<Input
							type="number"
							min={100}
							step={100}
							value={formData.intervalMs}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									intervalMs: parseInt(e.target.value),
								}))
							}
						/>
					</FormGroup>

					<FormGroup>
						<MetricsConfigEditor
							value={formData.metricsConfig}
							onChange={handleMetricsChange}
						/>
					</FormGroup>

					<ModalActions>
						<CancelButton type="button" onClick={onClose}>
							Cancelar
						</CancelButton>
						<SubmitButton type="submit">Guardar</SubmitButton>
					</ModalActions>
				</Form>
			</ModalContent>
		</Modal>
	);
}
