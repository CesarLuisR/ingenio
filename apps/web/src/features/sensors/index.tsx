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
	Select,
} from "./styled";

import SensorForm from "./components/SensorForm";

export default function Sensores() {
	const navigate = useNavigate();

	const {
		sensors,
		machines,
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

	// filtro por máquina
	const [machineFilterId, setMachineFilterId] = useState<"all" | number>(
		"all"
	);

	const sensorMap = useReadingsStore((s) => s.sensorMap);
	const activeMap = useActiveSensors(sensors);

	// Machine options para el select
	const machineOptions = useMemo(() => {
		return machines
			.map((m) => ({
				id: m.id,
				name: m.name,
				code: m.code ?? null,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [machines]);

	// Enriquecer sensores con actividad y lecturas
	const enrichedSensors = useMemo(() => {
		return filteredSensors.map((sensor) => {
			const key = sensor.sensorId ?? String(sensor.id);
			const readings = sensorMap.get(key) || [];
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
				isActive: !!activeMap[key],
				isEnabled: sensor.active,
			};
		});
	}, [filteredSensors, sensorMap, activeMap]);

	// Aplicar filtro por máquina y por modo
	const displayedSensors = useMemo(() => {
		let base = enrichedSensors;

		if (machineFilterId !== "all") {
			base = base.filter((s) => s.machineId === machineFilterId);
		}

		switch (filterMode) {
			case "active":
				return base.filter((s) => s.isActive);
			case "inactive":
				return base.filter((s) => !s.isActive);
			case "recent":
				return [...base]
					.filter((s) => s.lastReadingTime)
					.sort(
						(a, b) =>
							(b.lastReadingTime ?? 0) -
							(a.lastReadingTime ?? 0)
					);
			default:
				return base;
		}
	}, [enrichedSensors, machineFilterId, filterMode]);

	return (
		<Container>
			<Header>
				<Title>Gestión y Estado de Sensores</Title>
				<Button
					onClick={() =>
						window.alert(
							"La creación de nuevos sensores se habilitará más adelante."
						)
					}>
					+ Nuevo Sensor
				</Button>
			</Header>

			<div
				style={{
					display: "flex",
					gap: "1rem",
					marginBottom: "1rem",
					flexWrap: "wrap",
					alignItems: "center",
				}}>
				<SearchInput
					type="text"
					placeholder="Buscar sensores..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>

				{/* Filtro por máquina */}
				<Select
					value={
						machineFilterId === "all"
							? "all"
							: String(machineFilterId)
					}
					onChange={(e) => {
						const v = e.target.value;
						setMachineFilterId(
							v === "all" ? "all" : Number(v)
						);
					}}>
					<option value="all">Todas las máquinas</option>
					{machineOptions.map((m) => (
						<option key={m.id} value={m.id}>
							{m.name}
							{m.code ? ` (${m.code})` : ""}
						</option>
					))}
				</Select>

				<ButtonGroup>
					<FilterButton
						$active={filterMode === "all"}
						onClick={() => setFilterMode("all")}>
						Todos
					</FilterButton>
					<FilterButton
						$active={filterMode === "active"}
						onClick={() => setFilterMode("active")}>
						Activos
					</FilterButton>
					<FilterButton
						$active={filterMode === "inactive"}
						onClick={() => setFilterMode("inactive")}>
						Inactivos
					</FilterButton>
					<FilterButton
						$active={filterMode === "recent"}
						onClick={() => setFilterMode("recent")}>
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
								onClick={() =>
									navigate(
										`/sensor/${
											sensor.sensorId ?? sensor.id
										}`
									)
								}>
								<CardHeader>
									<div>
										<CardTitle>{sensor.name}</CardTitle>
										<CardSubtitle>
											{sensor.type}
										</CardSubtitle>

										{sensor.machine && (
											<p
												style={{
													margin: 0,
													fontSize: "0.85rem",
													color: "#6b7280",
												}}>
												🛠 Máquina:{" "}
												<strong>
													{sensor.machine.name}
												</strong>
												{sensor.machine.code
													? ` (${sensor.machine.code})`
													: ""}
											</p>
										)}
									</div>

									<Badge $status={badgeStatus}>
										{badgeLabel}
									</Badge>
								</CardHeader>

								<Location>
									📍{" "}
									{sensor.machine?.location ||
										sensor.location ||
										"Sin ubicación"}
								</Location>

								{sensor.lastReadingTime && (
									<p
										style={{
											fontSize: "0.9rem",
											color: "#475569",
										}}>
										Última lectura:{" "}
										{new Date(
											sensor.lastReadingTime
										).toLocaleTimeString()}
									</p>
								)}

								{sensor.lastReading && (
									<div
										style={{
											fontSize: "0.85rem",
											color: "#475569",
											marginBottom: "0.75rem",
										}}>
										<div>
											Estado: {" "}
											<strong>
												{sensor.lastStatus}
											</strong>
										</div>
										<div>
											Severidad: {sensor.severity}
										</div>
										<div>Issues: {sensor.totalIssues}</div>
										<div>
											Métricas: {sensor.metricsCount}
										</div>
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
											const sid =
												sensor.sensorId ??
												String(sensor.id);
											deactivateSensor(sid);
										}}>
										Desactivar
									</DangerButton>
								</ButtonGroup>
							</Card>
						);
					})}
				</Grid>
			)}

			{showForm && editingSensor && (
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
