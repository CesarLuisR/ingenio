import { InfoSection } from "../styled";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";

interface SensorMetricsProps {
	sensorId?: number | null;
}

interface MetricsResponse {
	availability: number | null;
	reliability: number | null;
	mtbf: number | null;
	mttr: number | null;
	mtta: number | null;
}

export function SensorMetrics({ sensorId }: SensorMetricsProps) {
	const [metrics, setMetrics] = useState<MetricsResponse | null>(null);

	useEffect(() => {
        console.log("EL ID: ", sensorId);
		if (!sensorId) return;

		(async () => {
			try {
				const res = await api.getSensorMetrics(sensorId);
				setMetrics(res);
			} catch (err) {
				console.error("Error cargando métricas:", err);
			}
		})();
	}, [sensorId]);

	if (!metrics) {
		return (
			<InfoSection>
				<h2>Métricas del Sensor</h2>
				<p>Cargando métricas...</p>
			</InfoSection>
		);
	}

	const pretty = (v: number | null, suffix = "") =>
		v === null ? "—" : v.toFixed(2) + suffix;

	return (
		<InfoSection>
			<h2>Métricas del Sensor</h2>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
					gap: "1rem",
					marginTop: "1rem",
				}}
			>
				<MetricCard
					label="Disponibilidad"
					value={pretty(metrics.availability, "%")}
					color="#d1fae5"
				/>

				<MetricCard
					label="Confiabilidad"
					value={pretty(metrics.reliability, "%")}
					color="#fef3c7"
				/>

				<MetricCard
					label="MTBF"
					value={pretty(metrics.mtbf, " h")}
					color="#e0f2fe"
				/>

				<MetricCard
					label="MTTR"
					value={pretty(metrics.mttr, " h")}
					color="#fee2e2"
				/>

				<MetricCard
					label="MTTA"
					value={pretty(metrics.mtta, " h")}
					color="#ede9fe"
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
