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
import type { Sensor, Machine } from "../../../types";
import { useSessionStore } from "../../../store/sessionStore";

interface SensorFormData {
	name: string;
	type: string;
	location: string;
	active: boolean;
	intervalMs: number;
	metricsConfig: any;
	ingenioId: number | null;
	machineId: number | null;
}

export default function SensorForm({
	sensor,
	onClose,
	onSave,
}: {
	sensor: Sensor | null;
	onClose: () => void;
	onSave: () => void;
}) {
	const initialConfig = sensor?.config || {};
	const initialMetrics = initialConfig.metricsConfig || {};
	const sensorId = sensor?.sensorId || initialConfig.sensorId || "";
	const user = useSessionStore((s) => s.user);

	if (!sensor) {
		console.error("POR ALGUNA RAZON NO ESTA LLEGANDO EL ERROR");
		throw new Error("POR ALGUNA RAZON NO ESTA LLEGANDO EL ERROR");
	}

	// Lista de máquinas disponibles
	const [machines, setMachines] = useState<Machine[]>([]);

	const [formData, setFormData] = useState<SensorFormData>({
		name: sensor?.name || "",
		type: sensor?.type || initialConfig.type || "",
		location: sensor?.location || initialConfig.location || "",
		active: sensor?.active ?? initialConfig.active ?? true,
		intervalMs: initialConfig.intervalMs || 1000,
		metricsConfig: initialMetrics,
		ingenioId: user?.ingenioId ?? null,
		machineId: sensor?.machineId ?? null,
	});

	// Cargar máquinas para el select
	useEffect(() => {
		api.getMachines().then(setMachines).catch(console.error);
	}, []);

	// Cuando cambia el sensor editado
	useEffect(() => {
		if (!user) return;
		const baseConfig = sensor?.config || {};
		const baseMetrics = baseConfig.metricsConfig || {};

		setFormData({
			name: sensor?.name || "",
			type: sensor?.type || baseConfig.type || "",
			location: sensor?.location || baseConfig.location || "",
			active: sensor?.active ?? baseConfig.active ?? true,
			intervalMs: baseConfig.intervalMs || 1000,
			metricsConfig: baseMetrics,
			ingenioId: user?.ingenioId ?? null,
			machineId: sensor?.machineId ?? null,
		});
	}, [sensor, user]);

	// Actualizar metricsConfig
	const handleMetricsChange = useCallback((cfg: any) => {
		setFormData((prev) => ({ ...prev, metricsConfig: cfg }));
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.machineId) {
			alert("Debes asignar este sensor a una máquina.");
			return;
		}

		try {
			const baseConfig = sensor?.config || {};

			const config = {
				sensorId: sensorId || crypto.randomUUID(),
				type: formData.type,
				location: formData.location,
				intervalMs: formData.intervalMs,
				metricsConfig: formData.metricsConfig,
				active: formData.active,
				configVersion: baseConfig.configVersion || "v1",
				createdAt: baseConfig.createdAt || new Date().toISOString(),
				lastSeen: sensor?.lastSeen || null,
				ingenioId: user?.ingenioId || 1,
				machineId: formData.machineId!
			};

			const payload = {
				name: formData.name,
				type: formData.type,
				location: formData.location,
				active: formData.active,
				config,
				machineId: formData.machineId,    // 👈 NUEVO
				ingenioId: formData.ingenioId!,   // 👈 coherencia
			};

			await api.updateSensor(sensor.id, payload);

			onSave();
			onClose();
		} catch (error) {
			console.error("Error guardando sensor:", error);
		}
	};

	return (
		<Modal>
			<ModalContent>
				<ModalTitle>Editar Sensor</ModalTitle>

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

					{/* NUEVO — selección de máquina */}
					<FormGroup>
						<Label>Máquina</Label>
						<Select
							value={formData.machineId ?? ""}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									machineId: Number(e.target.value),
								}))
							}>
							<option value="">Seleccionar máquina</option>
							{machines.map((m) => (
								<option key={m.id} value={m.id}>
									{m.name} {m.code ? `(${m.code})` : ""}
								</option>
							))}
						</Select>
					</FormGroup>

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
