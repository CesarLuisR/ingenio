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

export function SensorCharts({ chartData, latest }: SensorChartsProps) {
	if (!chartData || Object.keys(chartData).length === 0)
		return <p>Sin lecturas todavía.</p>;

	return (
		<>
			{Object.entries(chartData).map(([category, data]) => (
				<Card key={category}>
					<ChartHeader>
						<h2>{category.toUpperCase()}</h2>
					</ChartHeader>

					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={data}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis dataKey="time" />
							<YAxis />
							<Tooltip />
							<Legend />
							{Object.keys(latest.metrics[category] || {}).map((metric, i) => (
								<Line
									key={metric}
									type="monotone"
									dataKey={metric}
									stroke={COLORS[i % COLORS.length]}
									strokeWidth={2.5}
									dot={false}
									isAnimationActive={true}
									animationDuration={800}
								/>
							))}
						</LineChart>
					</ResponsiveContainer>

					<MetricStatus>
						{Object.entries(latest.metrics[category] || {}).map(
							([metric, val]: [string, any], i) => {
								const status =
									typeof val === "object" && val !== null && "status" in val
										? val.status
										: latest.status || "ok";
								return (
									<Status
										key={metric}
										status={status}
										style={{
											border: `2px solid ${COLORS[i % COLORS.length]}`,
										}}>
										{metric}: {getStatusLabel(status)}
									</Status>
								);
							}
						)}
					</MetricStatus>
				</Card>
			))}
		</>
	);
}
