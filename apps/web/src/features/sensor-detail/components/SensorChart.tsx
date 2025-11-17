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
	"#2563eb",
	"#dc2626",
	"#16a34a",
	"#f59e0b",
	"#8b5cf6",
	"#ec4899",
	"#0ea5e9",
	"#14b8a6",
];

function getStatusLabel(status?: string) {
	if (!status) return "unknown";
	if (status === "ok") return "✅ OK";
	if (status === "warning") return "⚠️ Warning";
	if (status === "critical") return "🚨 Critical";
	return "–";
}

interface CategoryChartProps {
	category: string;
	data: any[];
	latest: any;
}

/**  
 *  🔥 Componente optimizado con memoización
 *  Solo se renderiza si:
 *  - Cambia el array `data` de esta categoría
 *  - O cambia el `latest` usado por esta categoría
 */
const CategoryChart = React.memo(
	function CategoryChart({ category, data, latest }: CategoryChartProps) {
		if (!data || data.length === 0) {
			return (
				<Card>
					<ChartHeader>
						<h2>{category.toUpperCase()}</h2>
					</ChartHeader>
					<p style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
						No hay datos disponibles para esta categoría.
					</p>
				</Card>
			);
		}

		// Extraer métricas
		const firstPoint = data[0];
		const metrics = Object.keys(firstPoint).filter((key) => key !== "time");

		if (metrics.length === 0) {
			return (
				<Card>
					<ChartHeader>
						<h2>{category.toUpperCase()}</h2>
					</ChartHeader>
					<p style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
						No hay métricas disponibles.
					</p>
				</Card>
			);
		}

		// Añadir índice para eje X
		const displayData = useMemo(
			() =>
				data.map((point, index) => ({
					...point,
					index,
				})),
			[data]
		);

		const formatXAxis = (value: any, idx: number) => {
			if (idx < 0 || idx >= displayData.length) return "";
			const point = displayData[idx];
			return point?.time ? String(point.time) : String(idx);
		};

		return (
			<Card>
				<ChartHeader>
					<h2>{category.toUpperCase()}</h2>
					<span style={{ fontSize: "12px", color: "#64748b", fontWeight: "normal" }}>
						{displayData.length} lecturas
					</span>
				</ChartHeader>

				<ResponsiveContainer width="100%" height={320}>
					<LineChart
						data={displayData}
						margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

						<XAxis
							dataKey="index"
							type="number"
							domain={[0, Math.max(displayData.length - 1, 0)]}
							ticks={displayData.map((_, i) => i)}
							tickFormatter={formatXAxis}
							tick={{ fontSize: 10 }}
							angle={-45}
							textAnchor="end"
							height={70}
							interval={0}
						/>

						<YAxis tick={{ fontSize: 11 }} width={60} domain={["auto", "auto"]} />

						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(255, 255, 255, 0.98)",
								border: "1px solid #e2e8f0",
								borderRadius: "6px",
								fontSize: "12px",
								boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
							}}
							labelFormatter={(value) => {
								if (typeof value === "number" && value < displayData.length) {
									const p = displayData[value];
									return `Tiempo: ${p?.time || value}`;
								}
								return `Lectura: ${value}`;
							}}
						/>

						<Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />

						{metrics.map((metric, i) => (
							<Line
								key={metric}
								type="monotone"
								dataKey={metric}
								stroke={COLORS[i % COLORS.length]}
								strokeWidth={2.5}
								dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
								activeDot={{ r: 6 }}
								connectNulls={true}
								animationDuration={400}
								animationEasing="ease-out"
							/>
						))}
					</LineChart>
				</ResponsiveContainer>

				<MetricStatus>
					{metrics.map((metric, i) => {
						let status = "ok";

						if (latest?.metrics?.[category]?.[metric]) {
							const val = latest.metrics[category][metric];
							if (typeof val === "object" && val !== null && "status" in val) {
								status = val.status;
							}
						}

						if (!status && latest?.status) {
							status = latest.status;
						}

						return (
							<Status
								key={`${category}-${metric}`}
								status={status}
								style={{ border: `2px solid ${COLORS[i % COLORS.length]}` }}
							>
								{metric}: {getStatusLabel(status)}
							</Status>
						);
					})}
				</MetricStatus>
			</Card>
		);
	},
	// 🔥 MEMO comparador: evita renders si los props NO cambiaron
	(prev, next) => {
		return prev.data === next.data && prev.latest === next.latest;
	}
);

/**
 * Componente principal optimizado
 */
export function SensorCharts({ chartData, latest }: SensorChartsProps) {
	// Memoizamos entries para no recrear arrays en cada render
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
