import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useReadingsStore } from "../../store/readingState";
import { useSensors } from "./hooks/useSensors";
import { useActiveSensors } from "./hooks/useActiveSensors";
import type { Sensor } from "../../types";

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
	FilterButton,
} from "./styled";

import SensorForm from "./components/SensorForm";

export default function Sensores() {
	const navigate = useNavigate();

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
	const [filterMode, setFilterMode] =
		useState<"all" | "active" | "inactive" | "recent">("all");

	const sensorMap = useReadingsStore((s) => s.sensorMap);
	const activeMap = useActiveSensors(sensors);

	// Enriquecimiento de sensores
	const enrichedSensors = useMemo(() => {
		return filteredSensors.map((sensor) => {
			const sensorKey = sensor.sensorId ?? sensor.id;
			const readings = sensorMap.get(sensorKey) || [];
			const lastReading = readings.at(-1);

			let lastReadingTime: number | null = null;
			let lastStatus = "unknown";
			let severity = "-";
			let totalIssues = 0;
			let metricsCount = 0;

			if (lastReading) {
				lastReadingTime =
					typeof lastReading.timestamp === "string"
						? Date.parse(lastReading.timestamp)
						: Number(lastReading.timestamp);

				lastStatus = lastReading.status ?? "unknown";
				severity = lastReading.severityLevel?.toString() ?? "-";
				totalIssues = lastReading.totalIssues ?? 0;
				metricsCount = Object.keys(lastReading.metrics || {}).length;
			}

			return {
				...sensor,
				lastReading,
				lastReadingTime,
				lastStatus,
				severity,
				totalIssues,
				metricsCount,
				isActive: !!activeMap[sensorKey],
				isEnabled: sensor.active,
			};
		});
	}, [filteredSensors, sensorMap, activeMap]);

	const displayedSensors = useMemo(() => {
		switch (filterMode) {
			case "active":
				return enrichedSensors.filter((s) => s.isActive);
			case "inactive":
				return enrichedSensors.filter((s) => !s.isActive);
			case "recent":
				return [...enrichedSensors]
					.filter((s) => s.lastReadingTime)
					.sort((a, b) => (b.lastReadingTime ?? 0) - (a.lastReadingTime ?? 0));
			default:
				return enrichedSensors;
		}
	}, [enrichedSensors, filterMode]);

	return (
		<Container>
			<Header>
				<Title>Gestión y Estado de Sensores</Title>
				<Button
					onClick={() => {
						setEditingSensor(null);
						setShowForm(true);
					}}>
					+ Nuevo Sensor
				</Button>
			</Header>

			<div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
				<SearchInput
					type="text"
					placeholder="Buscar sensores..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>

				<ButtonGroup>
					<FilterButton $active={filterMode === "all"} onClick={() => setFilterMode("all")}>
						Todos
					</FilterButton>
					<FilterButton $active={filterMode === "active"} onClick={() => setFilterMode("active")}>
						Activos
					</FilterButton>
					<FilterButton $active={filterMode === "inactive"} onClick={() => setFilterMode("inactive")}>
						Inactivos
					</FilterButton>
					<FilterButton $active={filterMode === "recent"} onClick={() => setFilterMode("recent")}>
						Recientes
					</FilterButton>
				</ButtonGroup>
			</div>

			{loading ? (
				<Loading>Cargando sensores...</Loading>
			) : (
				<Grid>
					{displayedSensors.map((sensor) => {
						const badgeStatus = sensor.isActive
							? "active"
							: !sensor.isEnabled
							? "inactive"
							: "unknown";

						const badgeLabel = sensor.isActive
							? "Activo"
							: !sensor.isEnabled
							? "Desactivado"
							: "Sin actividad";

						return (
							<Card
								key={sensor.id}
								onClick={() => navigate(`/sensor/${sensor.sensorId ?? sensor.id}`)}
							>
								<CardHeader>
									<div>
										<CardTitle>{sensor.name}</CardTitle>
										<CardSubtitle>{sensor.type}</CardSubtitle>
									</div>

									<Badge $status={badgeStatus}>{badgeLabel}</Badge>
								</CardHeader>

								<Location>📍 {sensor.location || "Sin ubicación"}</Location>

								{sensor.lastReadingTime && (
									<p style={{ fontSize: "0.9rem", color: "#475569" }}>
										Última lectura: {new Date(sensor.lastReadingTime).toLocaleTimeString()}
									</p>
								)}

								{sensor.lastReading && (
									<div style={{ fontSize: "0.85rem", color: "#475569", marginBottom: "0.75rem" }}>
										<div>Estado: <strong>{sensor.lastStatus}</strong></div>
										<div>Severidad: {sensor.severity}</div>
										<div>Issues: {sensor.totalIssues}</div>
										<div>Métricas: {sensor.metricsCount}</div>
									</div>
								)}

								<ButtonGroup>
									<SecondaryButton
										onClick={(e) => {
											e.stopPropagation();
											setEditingSensor(sensor);
											setShowForm(true);
										}}>
										Editar
									</SecondaryButton>

									<DangerButton
										onClick={(e) => {
											e.stopPropagation();
											deactivateSensor(sensor.sensorId);
										}}>
										Desactivar
									</DangerButton>
								</ButtonGroup>
							</Card>
						);
					})}
				</Grid>
			)}

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
