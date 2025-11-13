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
import { useMemo } from "react";

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

export function SensorCharts({ chartData, latest }: SensorChartsProps) {
	if (!chartData || Object.keys(chartData).length === 0)
		return <p>Sin lecturas todavía.</p>;

	return (
		<>
			{Object.entries(chartData).map(([category, data]) => {
				// Asegura que el orden de métricas sea estable
				const metrics = useMemo(
					() => Object.keys(latest.metrics[category] || {}),
					[latest, category]
				);

				// Evita renders fuertes en real-time
				const preparedData = useMemo(() => data.slice(), [data]);

				return (
					<Card key={category}>
						<ChartHeader>
							<h2>{category.toUpperCase()}</h2>
						</ChartHeader>

						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={preparedData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
								<XAxis
									dataKey="time"
									tick={{ fontSize: 12 }}
									minTickGap={20}
								/>
								<YAxis tick={{ fontSize: 12 }} />
								<Tooltip />
								<Legend />

								{metrics.map((metric, i) => (
									<Line
										key={metric}
										type="monotone"
										dataKey={metric}
										stroke={COLORS[i % COLORS.length]}
										strokeWidth={2}
										dot={false}
										isAnimationActive={false} // para real-time es esencial
									/>
								))}
							</LineChart>
						</ResponsiveContainer>

						<MetricStatus>
							{metrics.map((metric, i) => {
								const val = latest.metrics[category][metric];
								const status =
									typeof val === "object" && val !== null && "status" in val
										? val.status
										: latest.status || "ok";

								return (
									<Status
										key={metric}
										status={status}
										style={{ border: `2px solid ${COLORS[i % COLORS.length]}` }}>
										{metric}: {getStatusLabel(status)}
									</Status>
								);
							})}
						</MetricStatus>
					</Card>
				);
			})}
		</>
	);
}
