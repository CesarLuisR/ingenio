import React, { useMemo } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { Card, ChartHeader, MetricStatus, Status } from "../styled";

interface SensorChartsProps {
	chartData: Record<string, any[]>;
	latest: any;
}

const COLORS = [
	"#4C7FF0",
	"#E45A5A",
	"#41B883",
	"#F0C14C",
	"#9B6DFF",
	"#F36BA0",
	"#4CB5E6",
	"#3ED1C3",
];

function getStatusLabel(status?: string) {
	if (!status) return "unknown";
	if (status === "ok") return "✅ OK";
	if (status === "warning") return "⚠️ Warning";
	if (status === "critical") return "🚨 Critical";
	return "–";
}

const MIN_RANGE = 1; // evita ejes planos

// Hace que el eje Y tenga números "bonitos" (redondeados)
function computeNiceDomain(min: number, max: number): [number, number] {
	if (!isFinite(min) || !isFinite(max)) return [0, 1];

	let range = max - min;
	if (range < MIN_RANGE) range = MIN_RANGE;

	// orden de magnitud del rango
	const magnitude = Math.pow(10, Math.floor(Math.log10(range)));
	// step base: la mitad de la magnitud, da algo tipo 0.5, 5, 50...
	const step = magnitude / 2;

	const niceMin = Math.floor(min / step) * step;
	const niceMax = Math.ceil(max / step) * step;

	return [niceMin, niceMax];
}

/* ============================================================
   CategoryChart — eje Y estable + números bonitos + puntos
   ============================================================ */
const CategoryChart = React.memo(
	function CategoryChart({ category, data, latest }: any) {
		if (!data || data.length === 0) {
			return (
				<Card>
					<ChartHeader>
						<h2>{category.toUpperCase()}</h2>
					</ChartHeader>
					<p style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
						No hay datos disponibles.
					</p>
				</Card>
			);
		}

		const metrics = useMemo(
			() => Object.keys(latest?.metrics?.[category] || {}),
			[latest, category]
		);

		const preparedData = useMemo(() => data.slice(), [data]);

		// Cálculo de min y max reales según los datos
		const rawDomain = useMemo(() => {
			let min = Infinity;
			let max = -Infinity;

			for (const point of preparedData) {
				for (const metric of metrics) {
					const v = Number(point[metric]);
					if (!isNaN(v)) {
						if (v < min) min = v;
						if (v > max) max = v;
					}
				}
			}

			if (!isFinite(min) || !isFinite(max)) {
				return [0, 1] as [number, number];
			}

			return [min, max] as [number, number];
		}, [preparedData, metrics]);

		// Dominio "bonito" para el eje Y
		const yDomain = useMemo<[number, number]>(
			() => computeNiceDomain(rawDomain[0], rawDomain[1]),
			[rawDomain]
		);

		return (
			<Card
				style={{
					boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
					borderRadius: "14px",
					paddingBottom: "10px",
				}}
			>
				<ChartHeader>
					<h2 style={{ fontWeight: 700 }}>{category.toUpperCase()}</h2>
					<span style={{ fontSize: "12px", color: "#94a3b8" }}>
						{preparedData.length} lecturas
					</span>
				</ChartHeader>

				<ResponsiveContainer width="100%" height={320}>
					<LineChart
						data={preparedData}
						margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
					>
						<CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" opacity={0.7} />

						<XAxis
							dataKey="time"
							tick={{ fontSize: 11, fill: "#64748b" }}
							minTickGap={20}
							angle={-35}
							textAnchor="end"
							height={60}
						/>

						{/* EJE Y CON NÚMEROS CORREGIDOS Y "BONITOS" */}
						<YAxis
							domain={yDomain}
							tick={{ fontSize: 12, fill: "#475569" }}
							tickFormatter={(value: any, index: number) => {
								// redondeo suave: sin mil decimales
								if (Math.abs(value) >= 100) {
									return Math.round(value); // enteros para valores grandes
								}
								return value.toFixed(2); // 2 decimales para valores normales
							}}
							tickCount={6}
						/>

						<Tooltip
							contentStyle={{
								background: "rgba(255,255,255,0.8)",
								backdropFilter: "blur(6px)",
								border: "1px solid #e2e8f0",
								borderRadius: "10px",
								boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
							}}
							labelStyle={{ fontWeight: 600, color: "#334155" }}
						/>

						<Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />

						{/* Líneas con puntos visibles pero fluidos en tiempo real */}
						{metrics.map((metric, i) => (
							<Line
								key={metric}
								type="monotone"
								dataKey={metric}
								stroke={COLORS[i % COLORS.length]}
								strokeWidth={2.3}
								dot={{
									r: 3,
									strokeWidth: 1.5,
									fill: "#ffffff",
									stroke: COLORS[i % COLORS.length],
								}}
								activeDot={{
									r: 6,
									strokeWidth: 2,
									stroke: COLORS[i % COLORS.length],
									fill: "#ffffff",
								}}
								isAnimationActive={false}
								connectNulls
							/>
						))}
					</LineChart>
				</ResponsiveContainer>

				<MetricStatus>
					{metrics.map((metric, i) => {
						const val = latest?.metrics?.[category]?.[metric];
						const status =
							typeof val === "object" && val !== null && "status" in val
								? val.status
								: latest?.status || "ok";

						return (
							<Status
								key={`${category}-${metric}`}
								status={status}
								style={{
									border: `2px solid ${COLORS[i % COLORS.length]}`,
								}}
							>
								{metric}: {getStatusLabel(status)}
							</Status>
						);
					})}
				</MetricStatus>
			</Card>
		);
	},
	(prev, next) => prev.data === next.data && prev.latest === next.latest
);

/* ============================================================
   Componente principal
   ============================================================ */
export function SensorCharts({ chartData, latest }: SensorChartsProps) {
	const entries = useMemo(() => Object.entries(chartData), [chartData]);

	if (!entries.length) return <p>Sin lecturas todavía.</p>;

	return (
		<>
			{entries.map(([category, data]) => (
				<CategoryChart
					key={category}
					category={category}
					data={data}
					latest={latest}
				/>
			))}
		</>
	);
}
