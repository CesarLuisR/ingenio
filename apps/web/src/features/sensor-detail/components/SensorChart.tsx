import { useEffect, useRef } from "react";
import {
	Chart,
	LineController,
	LineElement,
	PointElement,
	LinearScale,
	TimeScale,
	Tooltip,
	Legend,
	Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";
import streamingPlugin from "chartjs-plugin-streaming";
import { useReadingsStore } from "../../../store/readingState";
import { Card, ChartHeader } from "../styled";

Chart.register(
	LineController,
	LineElement,
	PointElement,
	LinearScale,
	TimeScale,
	Tooltip,
	Legend,
	Filler,
	streamingPlugin
);

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

interface SensorChartsProps {
	sensorId: string;
}

export function SensorCharts({ sensorId }: SensorChartsProps) {
	const sensorMap = useReadingsStore((s) => s.sensorMap);
	const chartRefs = useRef<Record<string, Chart>>({});

	useEffect(() => {
		// Limpieza previa
		Object.values(chartRefs.current).forEach((chart) => chart.destroy());
		chartRefs.current = {};

		const readings = sensorMap.get(sensorId);
		if (!readings || readings.length === 0) return;

		const latest = readings[readings.length - 1];
		const metricsMap = latest.metrics || {};

		// 🔹 Crear un gráfico por cada métrica individual
		Object.entries(metricsMap).forEach(([category, metrics]) => {
			Object.entries(metrics).forEach(([metric, val], i) => {
				const chartId = `chart-${sensorId}-${category}-${metric}`;
				const canvas = document.getElementById(
					chartId
				) as HTMLCanvasElement | null;
				if (!canvas) return;
				const ctx = canvas.getContext("2d");
				if (!ctx) return;

				// Crea un nuevo gráfico por métrica
				const chart = new Chart(ctx, {
					type: "line",
					data: {
						datasets: [
							{
								label: `${category}.${metric}`,
								borderColor: COLORS[i % COLORS.length],
								borderWidth: 2,
								backgroundColor: "transparent",
								data: [],
								fill: false,
								tension: 0.3,
							},
						],
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						animation: false,
						scales: {
							x: {
								type: "realtime",
								realtime: {
									duration: 60000, // 1 min visible
									refresh: 1000,
									delay: 2000,
									frameRate: 30,
									onRefresh: (chart) => {
										const readings =
											sensorMap.get(sensorId);
										if (!readings || readings.length === 0)
											return;
										const last =
											readings[readings.length - 1];
										const timestamp = new Date(
											last.timestamp
										).getTime();
										const valueObj =
											last.metrics?.[category]?.[metric];
										const value =
											typeof valueObj === "object" &&
											valueObj !== null &&
											"value" in valueObj
												? (valueObj as any).value
												: valueObj;
										chart.data.datasets[0].data.push({
											x: timestamp,
											y: value,
										});
									},
								},
							},
							y: {
								min: 0,
								max: 100, // ajusta según tipo de dato
								ticks: { stepSize: 10 },
							},
						},
						plugins: {
							legend: { display: false },
							tooltip: { mode: "nearest", intersect: false },
						},
					},
				});

				chartRefs.current[chartId] = chart;
			});
		});

		return () => {
			Object.values(chartRefs.current).forEach((chart) =>
				chart.destroy()
			);
			chartRefs.current = {};
		};
	}, [sensorId, sensorMap]);

	const readings = sensorMap.get(sensorId);
	if (!readings || readings.length === 0) return <p>Sin lecturas todavía.</p>;

	const latest = readings[readings.length - 1];
	const groupedMetrics = Object.entries(latest.metrics || {});

	return (
		<>
			{groupedMetrics.map(([category, metrics]) => (
				<Card key={category}>
					<ChartHeader>
						<h2>{category.toUpperCase()}</h2>
					</ChartHeader>

					{Object.keys(metrics).map((metric, i) => {
						const chartId = `chart-${sensorId}-${category}-${metric}`;
						return (
							<div
								key={metric}
								style={{
									marginBottom: "1.5rem",
									borderLeft: `4px solid ${
										COLORS[i % COLORS.length]
									}`,
									paddingLeft: "0.5rem",
								}}>
								<h3
									style={{
										fontSize: "0.9rem",
										color: "#444",
									}}>
									{metric.toUpperCase()}
								</h3>
								<div style={{ height: 200, width: "100%" }}>
									<canvas
										id={chartId}
										style={{
											width: "100%",
											height: "100%",
										}}
									/>
								</div>
							</div>
						);
					})}
				</Card>
			))}
		</>
	);
}
