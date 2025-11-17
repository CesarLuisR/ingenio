// src/pages/Dashboard/Dashboard.tsx
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import {
	Container,
	Header,
	Title,
	Subtitle,
	MetricsGrid,
	MetricCard,
	MetricLabel,
	MetricValue,
	MetricUnit,
	HealthBadge,
	Loader,
	ErrorBox,
} from "./styled";
import type { BaseMetrics } from "../../types";

// Cambia esto luego por el ingenio dinámico (según user.ingenioId)
const INGENIO_ID = 1;

interface IngenioMetrics {
	availability: number | null;
	reliability: number | null;
	mtbf: number | null;
	mttr: number | null;
	mtta: number | null;
}

const formatPercent = (v: number | null) =>
	v == null ? "—" : `${v.toFixed(2)}%`;

const formatHours = (value: number | null) => {
	if (value == null) return "—";

	if (value >= 24) {
		const days = Math.floor(value / 24);
		const hours = Math.round(value % 24);
		return hours === 0 ? `${days}d` : `${days}d ${hours}h`;
	}

	if (value < 1) return `${Math.round(value * 60)} min`;

	return `${value.toFixed(1)} h`;
};

const getHealth = (availability: number | null, reliability: number | null) => {
	if (availability == null || reliability == null) return "neutral";

	if (availability > 97 && reliability > 97) return "ok";
	if (availability > 93 && reliability > 93) return "warning";

	return "critical";
};

export default function Dashboard() {
	const [metrics, setMetrics] = useState<IngenioMetrics | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const m: BaseMetrics = await api.getIngenioMetrics(INGENIO_ID);
				setMetrics(m);
			} catch (err) {
				setError("No se pudieron cargar las métricas.");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const health = getHealth(
		metrics?.availability ?? null,
		metrics?.reliability ?? null
	);

	return (
		<Container>
			<Header>
				<div>
					<Title>Dashboard Operativo</Title>
					<Subtitle>Métricas de salud del ingenio</Subtitle>
				</div>

				<HealthBadge status={health}>
					{health === "ok"
						? "Óptimo"
						: health === "warning"
						? "Alerta"
						: health === "critical"
						? "Crítico"
						: "Sin datos"}
				</HealthBadge>
			</Header>

			{loading && <Loader>Cargando...</Loader>}
			{error && <ErrorBox>{error}</ErrorBox>}

			{!loading && !error && metrics && (
				<MetricsGrid>
					<MetricCard>
						<MetricLabel>Disponibilidad</MetricLabel>
						<MetricValue>
							{formatPercent(metrics.availability)}
						</MetricValue>
						<MetricUnit>Tiempo operativo</MetricUnit>
					</MetricCard>

					<MetricCard>
						<MetricLabel>Confiabilidad</MetricLabel>
						<MetricValue>
							{formatPercent(metrics.reliability)}
						</MetricValue>
						<MetricUnit>MTBF / MTTR</MetricUnit>
					</MetricCard>

					<MetricCard>
						<MetricLabel>MTBF</MetricLabel>
						<MetricValue>{formatHours(metrics.mtbf)}</MetricValue>
						<MetricUnit>Entre fallas</MetricUnit>
					</MetricCard>

					<MetricCard>
						<MetricLabel>MTTR</MetricLabel>
						<MetricValue>{formatHours(metrics.mttr)}</MetricValue>
						<MetricUnit>Reparación</MetricUnit>
					</MetricCard>

					<MetricCard>
						<MetricLabel>MTTA</MetricLabel>
						<MetricValue>{formatHours(metrics.mtta)}</MetricValue>
						<MetricUnit>Atención</MetricUnit>
					</MetricCard>
				</MetricsGrid>
			)}
		</Container>
	);
}
