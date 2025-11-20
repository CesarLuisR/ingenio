import { InfoSection } from "../styled";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";

interface SensorMetricsProps {
	sensorId?: number | null;
}

interface SensorHealth {
	active: boolean;
	lastSeen: string | null;
	lastAnalysis: any | null;
}

export function SensorMetrics({ sensorId }: SensorMetricsProps) {
	const [health, setHealth] = useState<SensorHealth | null>(null);

	useEffect(() => {
		if (!sensorId) return;

		(async () => {
			try {
				const res = await api.getSensorHealth(sensorId);
				setHealth(res);
			} catch (err) {
				console.error("Error cargando salud del sensor:", err);
			}
		})();
	}, [sensorId]);

	if (!health) {
		return (
			<InfoSection>
				<h2>Salud del Sensor</h2>
				<p>Cargando datos...</p>
			</InfoSection>
		);
	}

	return (
		<InfoSection>
			<h2>Salud del Sensor</h2>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
					gap: "1rem",
					marginTop: "1rem",
				}}
			>
				<MetricCard
					label="Estado"
					value={health.active ? "Activo" : "Inactivo"}
					color={health.active ? "#d1fae5" : "#fee2e2"}
				/>

				<MetricCard
					label="Última señal"
					value={
						health.lastSeen
							? new Date(health.lastSeen).toLocaleString()
							: "—"
					}
					color="#e0f2fe"
				/>

				<MetricCard
					label="Último análisis"
					value={
						health.lastAnalysis
							? "Disponible"
							: "No disponible"
					}
					color="#fef3c7"
				/>
			</div>
		</InfoSection>
	);
}

function MetricCard({
	label,
	value,
	color,
}: {
	label: string;
	value: string;
	color: string;
}) {
	return (
		<div
			style={{
				padding: "1rem",
				borderRadius: "8px",
				backgroundColor: color,
				border: "1px solid rgba(0,0,0,0.06)",
				fontFamily: "Inter, sans-serif",
			}}
		>
			<div style={{ fontSize: "0.85rem", color: "#334155" }}>{label}</div>
			<div style={{ fontSize: "1.4rem", fontWeight: 600, color: "#0f172a" }}>
				{value}
			</div>
		</div>
	);
}
