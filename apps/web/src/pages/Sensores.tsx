import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { api, type Sensor, type Reading } from "../lib/api";
import { useReadingsStore } from "../store/readingState"; // ✅ Zustand

// === Styled Components ===
const Container = styled.div``;

const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1.5rem;
`;

const Title = styled.h1`
	font-size: 1.875rem;
	font-weight: bold;
	color: #111827;
	margin: 0;
`;

const Button = styled.button`
	padding: 0.5rem 1rem;
	background-color: #2563eb;
	color: white;
	border-radius: 0.5rem;
	border: none;
	cursor: pointer;
	transition: background-color 0.2s;

	&:hover {
		background-color: #1d4ed8;
	}
`;

const SearchInput = styled.input`
	width: 100%;
	padding: 0.5rem 1rem;
	border: 1px solid #d1d5db;
	border-radius: 0.5rem;
	margin-bottom: 1.5rem;
`;

const Grid = styled.div`
	display: grid;
	gap: 1rem;
	grid-template-columns: 1fr;

	@media (min-width: 768px) {
		grid-template-columns: repeat(2, 1fr);
	}

	@media (min-width: 1024px) {
		grid-template-columns: repeat(3, 1fr);
	}
`;

const Card = styled.div`
	background-color: white;
	border-radius: 0.5rem;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	padding: 1.25rem;
	border: 1px solid #e5e7eb;
`;

const CardHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 0.75rem;
`;

const CardTitle = styled.h3`
	font-weight: 600;
	font-size: 1.125rem;
	color: #111827;
	margin: 0;
`;

const CardSubtitle = styled.p`
	font-size: 0.875rem;
	color: #6b7280;
	margin: 0;
`;

const Badge = styled.span<{ $status: string }>`
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.75rem;
	font-weight: 500;
	background-color: ${(props) =>
		props.$status === "active"
			? "#d1fae5"
			: props.$status === "maintenance"
			? "#fef3c7"
			: "#f3f4f6"};
	color: ${(props) =>
		props.$status === "active"
			? "#065f46"
			: props.$status === "maintenance"
			? "#92400e"
			: "#374151"};
`;

const Location = styled.p`
	font-size: 0.875rem;
	color: #4b5563;
	margin-bottom: 1rem;
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: 0.5rem;
`;

const SecondaryButton = styled.button`
	flex: 1;
	padding: 0.375rem 0.75rem;
	background-color: #f3f4f6;
	color: #374151;
	border-radius: 0.25rem;
	border: none;
	cursor: pointer;
	font-size: 0.875rem;
	transition: background-color 0.2s;

	&:hover {
		background-color: #e5e7eb;
	}
`;

const DangerButton = styled(SecondaryButton)`
	background-color: #fee2e2;
	color: #991b1b;

	&:hover {
		background-color: #fecaca;
	}
`;

const Loading = styled.div`
	text-align: center;
	padding: 3rem;
`;

const Modal = styled.div`
	position: fixed;
	inset: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1rem;
	z-index: 50;
`;

const ModalContent = styled.div`
	background-color: white;
	border-radius: 0.5rem;
	box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
	max-width: 32rem;
	width: 100%;
	padding: 1.5rem;
	max-height: 90vh;
	overflow-y: auto;
`;

const ModalTitle = styled.h2`
	font-size: 1.25rem;
	font-weight: bold;
	margin-bottom: 1rem;
`;

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`;

const FormGroup = styled.div``;

const Label = styled.label`
	display: block;
	font-size: 0.875rem;
	font-weight: 500;
	color: #374151;
	margin-bottom: 0.25rem;
`;

const Input = styled.input`
	width: 100%;
	padding: 0.5rem 0.75rem;
	border: 1px solid #d1d5db;
	border-radius: 0.5rem;
`;

const Select = styled.select`
	width: 100%;
	padding: 0.5rem 0.75rem;
	border: 1px solid #d1d5db;
	border-radius: 0.5rem;
`;

const ModalActions = styled.div`
	display: flex;
	gap: 0.75rem;
	padding-top: 1rem;
`;

const CancelButton = styled.button`
	flex: 1;
	padding: 0.5rem 1rem;
	border: 1px solid #d1d5db;
	border-radius: 0.5rem;
	background-color: white;
	cursor: pointer;

	&:hover {
		background-color: #f9fafb;
	}
`;

const SubmitButton = styled.button`
	flex: 1;
	padding: 0.5rem 1rem;
	background-color: #2563eb;
	color: white;
	border-radius: 0.5rem;
	border: none;
	cursor: pointer;

	&:hover {
		background-color: #1d4ed8;
	}
`;

// === MAIN COMPONENT ===
export default function Sensores() {
	const [sensors, setSensors] = useState<Sensor[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});
	const [now, setNow] = useState(() => Date.now());

	const addReading = useReadingsStore((s) => s.addReading);
	const sensorMap = useReadingsStore((s) => s.sensorMap);

	const wsRef = useRef<WebSocket | null>(null);

	// === WebSocket: recibe lecturas y actualiza el estado global ===
	useEffect(() => {
		const wsUrl =
			window.location.hostname === "localhost"
				? "ws://localhost:5000/ws"
				: "ws://api:5000/ws";

		const ws = new WebSocket(wsUrl);
		wsRef.current = ws;

		ws.onopen = () => console.log("✅ WebSocket conectado");
		ws.onclose = () => console.log("🔴 WebSocket cerrado");
		ws.onerror = (err) => console.error("❌ Error WebSocket:", err);
		ws.onmessage = (event) => {
			try {
				const msg = JSON.parse(event.data);
				if (msg.type === "reading") {
					const reading: Reading = msg.payload || msg.data;
					if (!reading?.sensorId) return;
					addReading(reading);
				}
			} catch (err) {
				console.error("Error parseando WS:", err);
			}
		};

		return () => {
			ws.close();
			wsRef.current = null;
		};
	}, [addReading]);

	// === Tick de tiempo para que los activos expiren sin nuevas lecturas ===
	useEffect(() => {
		const id = setInterval(() => {
			setNow(Date.now());
		}, 5000); // cada 5s recalculamos

		return () => clearInterval(id);
	}, []);

	// === Cargar sensores desde la API ===
	useEffect(() => {
		(async () => {
			try {
				const data = await api.getSensors();
				setSensors(data);
			} catch (error) {
				console.error("Error cargando sensores:", error);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	// === Determinar sensores activos en base a datos de la DB + estado global ===
	useEffect(() => {
		if (!sensors.length) return;

		const newActiveMap: Record<string, boolean> = {};

		sensors.forEach((sensor) => {
			// clave consistente entre DB y readings
			const key = (sensor as any).sensorId ?? sensor.id;
			const readings = sensorMap.get(key);
			if (!readings || readings.length === 0) {
				return;
			}

			const last = readings[readings.length - 1];
			if (!last?.timestamp) return;

			const ts =
				typeof last.timestamp === "string"
					? Date.parse(last.timestamp)
					: Number(last.timestamp);

			if (Number.isNaN(ts)) return;

			const diff = now - ts;
			const isActive = diff < 30000; // 30 segundos

			newActiveMap[key] = isActive;
		});

		setActiveMap(newActiveMap);
	}, [sensors, sensorMap, now]);

	const handleDelete = async (id: string) => {
		if (!confirm("¿Eliminar este sensor?")) return;
		try {
			await api.deleteSensor(id);
			setSensors((prev) => prev.filter((s) => s.id !== id));
		} catch (error) {
			console.error("Error eliminando sensor:", error);
		}
	};

	const filteredSensors = sensors.filter(
		(s) =>
			s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			s.location.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (loading) return <Loading>Cargando sensores...</Loading>;

	return (
		<Container>
			<Header>
				<Title>Gestión de Sensores</Title>
				<Button
					onClick={() => {
						setShowForm(true);
						setEditingSensor(null);
					}}>
					+ Nuevo Sensor
				</Button>
			</Header>

			<SearchInput
				type="text"
				placeholder="Buscar sensores..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
			/>

			<Grid>
				{filteredSensors.map((sensor) => {
					// la misma clave que usamos en el cálculo de activos
					const sensorKey = (sensor as any).sensorId ?? sensor.id;
					const readings = sensorMap.get(sensorKey) || [];
					const lastReading =
						readings.length > 0
							? readings[readings.length - 1]
							: undefined;
					const isActive = !!activeMap[sensorKey];

					return (
						<Card key={sensor.id}>
							<CardHeader>
								<div>
									<CardTitle>{sensor.name}</CardTitle>
									<CardSubtitle>{sensor.type}</CardSubtitle>
								</div>
								<Badge
									$status={
										isActive
											? "active"
											: sensor.status || "inactive"
									}>
									{isActive
										? "Activo"
										: sensor.status === "maintenance"
										? "Mantenimiento"
										: "Inactivo"}
								</Badge>
							</CardHeader>

							<Location>📍 {sensor.location}</Location>

							{lastReading && (
								<p
									style={{
										color: "#6b7280",
										fontSize: "0.875rem",
										marginBottom: "0.5rem",
									}}>
									Última lectura:{" "}
									{new Date(
										typeof lastReading.timestamp ===
										"string"
											? lastReading.timestamp
											: lastReading.timestamp
									).toLocaleTimeString()}
								</p>
							)}

							<ButtonGroup>
								<SecondaryButton
									onClick={() => {
										setEditingSensor(sensor);
										setShowForm(true);
									}}>
									Editar
								</SecondaryButton>
								<DangerButton
									onClick={() => handleDelete(sensor.id)}>
									Eliminar
								</DangerButton>
							</ButtonGroup>
						</Card>
					);
				})}
			</Grid>

			{showForm && (
				<SensorForm
					sensor={editingSensor}
					onClose={() => {
						setShowForm(false);
						setEditingSensor(null);
					}}
					onSave={async () => {
						const data = await api.getSensors();
						setSensors(data);
						setShowForm(false);
						setEditingSensor(null);
					}}
				/>
			)}
		</Container>
	);
}

// === Subcomponente: MetricsConfigEditor ===
function MetricsConfigEditor({
	value,
	onChange,
}: {
	value: any;
	onChange: (val: any) => void;
}) {
	const [config, setConfig] = useState(value || {});

	const addGroup = () => {
		const name = prompt("Nombre del nuevo grupo:");
		if (!name) return;
		setConfig({ ...config, [name]: {} });
	};

	const addMetric = (group: string) => {
		const name = prompt(`Nombre de la métrica en ${group}:`);
		if (!name) return;
		setConfig({
			...config,
			[group]: { ...config[group], [name]: { min: 0, max: 0 } },
		});
	};

	const updateMetric = (
		group: string,
		metric: string,
		field: "min" | "max",
		value: number
	) => {
		setConfig({
			...config,
			[group]: {
				...config[group],
				[metric]: { ...config[group][metric], [field]: value },
			},
		});
	};

	const removeMetric = (group: string, metric: string) => {
		const newGroup = { ...config[group] };
		delete newGroup[metric];
		setConfig({ ...config, [group]: newGroup });
	};

	const removeGroup = (group: string) => {
		const newConfig = { ...config };
		delete newConfig[group];
		setConfig(newConfig);
	};

	useEffect(() => {
		onChange(config);
	}, [config, onChange]);

	return (
		<div>
			<h3>Configuración de métricas</h3>
			{Object.keys(config).map((group) => (
				<div
					key={group}
					style={{
						border: "1px solid #ddd",
						margin: "1rem 0",
						padding: "0.75rem",
					}}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
						}}>
						<h4>{group}</h4>
						<button
							type="button"
							onClick={() => removeGroup(group)}>
							🗑️
						</button>
					</div>

					{Object.entries(config[group]).map(
						([metric, vals]: any) => (
							<div
								key={metric}
								style={{
									display: "flex",
									gap: "0.5rem",
									alignItems: "center",
								}}>
								<strong>{metric}</strong>
								<label>
									min:{" "}
									<input
										type="number"
										value={vals.min}
										onChange={(e) =>
											updateMetric(
												group,
												metric,
												"min",
												parseFloat(e.target.value)
											)
										}
									/>
								</label>
								<label>
									max:{" "}
									<input
										type="number"
										value={vals.max}
										onChange={(e) =>
											updateMetric(
												group,
												metric,
												"max",
												parseFloat(e.target.value)
											)
										}
									/>
								</label>
								<button
									type="button"
									onClick={() => removeMetric(group, metric)}>
									🗑️
								</button>
							</div>
						)
					)}

					<button type="button" onClick={() => addMetric(group)}>
						+ Añadir métrica
					</button>
				</div>
			))}
			<button type="button" onClick={addGroup}>
				+ Añadir grupo
			</button>
		</div>
	);
}

// === Subcomponente: SensorForm ===
function SensorForm({
	sensor,
	onClose,
	onSave,
}: {
	sensor: Sensor | null;
	onClose: () => void;
	onSave: () => void;
}) {
	const [formData, setFormData] = useState<any>({
		name: sensor?.name || "",
		type: sensor?.type || "",
		location: sensor?.location || "",
		status: sensor?.status || "active",
		metricsConfig: (sensor as any)?.metricsConfig || {},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (sensor) {
				await api.updateSensor(sensor.id, formData);
			} else {
				await api.createSensor(formData);
			}
			onSave();
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
								setFormData({
									...formData,
									name: e.target.value,
								})
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
								setFormData({
									...formData,
									type: e.target.value,
								})
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
								setFormData({
									...formData,
									location: e.target.value,
								})
							}
						/>
					</FormGroup>

					<FormGroup>
						<Label>Estado</Label>
						<Select
							value={formData.status}
							onChange={(e) =>
								setFormData({
									...formData,
									status: e.target.value,
								})
							}>
							<option value="active">Activo</option>
							<option value="inactive">Inactivo</option>
							<option value="maintenance">Mantenimiento</option>
						</Select>
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
