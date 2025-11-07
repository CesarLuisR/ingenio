import { useState, useEffect } from "react";
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
	// Extract config and metricsConfig safely
	const baseConfig = sensor?.config || {};
	const baseMetrics = baseConfig.metricsConfig || {};

	const [formData, setFormData] = useState({
		name: sensor?.name || baseConfig.name || "",
		type: sensor?.type || baseConfig.type || "",
		location: sensor?.location || baseConfig.location || "",
		active: sensor?.active ?? baseConfig.active ?? true,
		intervalMs: baseConfig.intervalMs || 1000,
		metricsConfig: baseMetrics,
	});

	// Ensure consistency between top-level and nested config
	useEffect(() => {
		setFormData((prev) => ({
			...prev,
			config: {
				name: prev.name,
				type: prev.type,
				location: prev.location,
				active: prev.active,
				intervalMs: prev.intervalMs,
				metricsConfig: prev.metricsConfig,
			},
		}));
	}, [
		formData.name,
		formData.type,
		formData.location,
		formData.active,
		formData.intervalMs,
		formData.metricsConfig,
	]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const payload = {
				name: formData.name,
				type: formData.type,
				location: formData.location,
				active: formData.active,
				config: {
					name: formData.name,
					type: formData.type,
					location: formData.location,
					active: formData.active,
					intervalMs: formData.intervalMs,
					metricsConfig: formData.metricsConfig,
				},
			};

			if (sensor) {
				await api.updateSensor(sensor.sensorId, payload);
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
						<Label>Nombre</Label>
						<Input
							type="text"
							required
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
						/>
					</FormGroup>

					<FormGroup>
						<Label>Tipo</Label>
						<Input
							type="text"
							required
							value={formData.type}
							onChange={(e) =>
								setFormData({ ...formData, type: e.target.value })
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
								setFormData({ ...formData, location: e.target.value })
							}
						/>
					</FormGroup>

					<FormGroup>
						<Label>Estado</Label>
						<Select
							value={formData.active ? "active" : "inactive"}
							onChange={(e) =>
								setFormData({
									...formData,
									active: e.target.value === "active",
								})
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
								setFormData({
									...formData,
									intervalMs: parseInt(e.target.value),
								})
							}
						/>
					</FormGroup>

					<FormGroup>
						<MetricsConfigEditor
							value={formData.metricsConfig}
							onChange={(cfg) =>
								setFormData({
									...formData,
									metricsConfig: cfg,
								})
							}
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
