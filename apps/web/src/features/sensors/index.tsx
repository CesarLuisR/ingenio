import { useState } from "react";
import { useReadingsStore } from "../../store/readingState";
import { useSensors } from "./hooks/useSensors";
import {
	Badge,
	Button,
	ButtonGroup,
	Card,
	CardHeader,
	CardSubtitle,
	CardTitle,
	Container,
	DangerButton,
	Grid,
	Header,
	Loading,
	Location,
	SearchInput,
	SecondaryButton,
	Title,
} from "./styled";
import SensorForm from "./components/SensorForm";
import { useActiveSensors } from "./hooks/useActiveSensors";
import { useWebSocketReadings } from "../shared/hooks/useWebSocketReadings";
import type { Sensor } from "../../types";

export default function Sensores() {
	useWebSocketReadings();

	const {
		sensors,
		filteredSensors,
		loading,
		searchTerm,
		setSearchTerm,
		reload,
		deactivateSensor,
	} = useSensors();

	const [showForm, setShowForm] = useState(false);
	const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);

	const sensorMap = useReadingsStore((s) => s.sensorMap);
	const activeMap = useActiveSensors(sensors);

	if (loading) return <Loading>Cargando sensores...</Loading>;

	return (
		<Container>
			<Header>
				<Title>Gestión de Sensores</Title>
				<Button
					onClick={() => {
						setEditingSensor(null);
						setShowForm(true);
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
					const sensorKey = sensor.sensorId ?? sensor.id;
					const readings = sensorMap.get(sensorKey) || [];
					const lastReading = readings.at(-1);

					// Backend "active" state + websocket activity
					const isActiveNow = !!activeMap[sensorKey];
					const isEnabled = sensor.active;

					const badgeStatus = isActiveNow
						? "active"
						: !isEnabled
						? "inactive"
						: "unknown";

					const badgeLabel = isActiveNow
						? "Activo"
						: !isEnabled
						? "Desactivado"
						: "Sin actividad";

					return (
						<Card key={sensor.id}>
							<CardHeader>
								<div>
									<CardTitle>{sensor.name}</CardTitle>
									<CardSubtitle>{sensor.type}</CardSubtitle>
								</div>
								<Badge $status={badgeStatus}>{badgeLabel}</Badge>
							</CardHeader>

							<Location>📍 {sensor.location || "Sin ubicación"}</Location>

							{lastReading && (
								<p
									style={{
										color: "#6b7280",
										fontSize: "0.875rem",
										marginBottom: "0.5rem",
									}}>
									Última lectura:{" "}
									{new Date(
										typeof lastReading.timestamp === "string"
											? lastReading.timestamp
											: Number(lastReading.timestamp)
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
									onClick={() => deactivateSensor(sensor.sensorId)}>
									Desactivar
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
					onSave={reload}
				/>
			)}
		</Container>
	);
}
