import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
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
import {
	api,
	type Reading,
	type Maintenance,
	type Failure,
	type AnalysisResponse,
} from "../lib/api";

const MAX_POINTS = 30;

// === Animación sutil de aparición ===
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// === styled-components ===
const Page = styled.div`
	padding: 2rem;
	background-color: #f3f4f6;
	min-height: 100vh;
	animation: ${fadeIn} 0.4s ease;
`;

const Title = styled.h1`
	font-size: 1.875rem;
	font-weight: bold;
	color: #111827;
	margin-bottom: 1.5rem;
`;

const Sub = styled.p`
	color: #6b7280;
	margin-top: -1rem;
	margin-bottom: 2rem;
`;

const Card = styled.div`
	background-color: white;
	border-radius: 12px;
	padding: 16px;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
	margin-bottom: 2rem;
	transition: transform 0.2s ease, box-shadow 0.2s ease;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
`;

const ChartHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;

	h2 {
		font-size: 1.25rem;
		color: #1e40af;
	}
`;

const MetricStatus = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	margin-top: 1rem;
`;

const Status = styled.span<{ status: string }>`
	display: inline-block;
	padding: 4px 10px;
	border-radius: 6px;
	font-weight: 500;
	color: ${(p) =>
		p.status === "ok"
			? "#065f46"
			: p.status === "warning"
			? "#92400e"
			: p.status === "critical"
			? "#991b1b"
			: "#374151"};
	background-color: ${(p) =>
		p.status === "ok"
			? "#d1fae5"
			: p.status === "warning"
			? "#fef3c7"
			: p.status === "critical"
			? "#fee2e2"
			: "#e5e7eb"};
`;

const InfoSection = styled.div`
	background-color: white;
	border-radius: 8px;
	padding: 1.25rem;
	margin-bottom: 1.5rem;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

	h2 {
		color: #1e3a8a;
		font-size: 1.125rem;
		margin-bottom: 0.75rem;
	}
`;

const CodeBox = styled.pre`
	background: #f8fafc;
	padding: 1rem;
	border-radius: 8px;
	font-size: 0.9rem;
	overflow-x: auto;
	color: #334155;
`;

// === componente principal ===
export default function SensorDetail() {
	const { id } = useParams<{ id: string }>();
	const [history, setHistory] = useState<Reading[]>([]);
	const [sensorName, setSensorName] = useState<string>("");
	const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
	const [failures, setFailures] = useState<Failure[]>([]);
	const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
	const [chartData, setChartData] = useState<Record<string, any[]>>({});
	const wsRef = useRef<WebSocket | null>(null);

	// === cargar datos iniciales ===
	useEffect(() => {
		const loadBaseData = async () => {
			try {
				const sensor = await api.getSensor(String(id));
				setSensorName(sensor.name);

				const [maints, fails, anal] = await Promise.all([
					api.getMaintenances(),
					api.getFailures(),
					api.analyzeData([String(id)]),
				]);

				setMaintenances(
					maints.filter((m) => m.sensorId === sensor.sensorId)
				);
				setFailures(
					fails.filter((f) => f.sensorId === sensor.sensorId)
				);
				setAnalysis(anal);
			} catch (err) {
				console.error("Error cargando datos base:", err);
			}
		};
		loadBaseData();
	}, [id]);

	// === WebSocket ===
	useEffect(() => {
		const wsUrl =
			window.location.hostname === "localhost"
				? "ws://localhost:5000/ws"
				: "ws://api:5000/ws";

		const ws = new WebSocket(wsUrl);
		wsRef.current = ws;

		ws.onopen = () => console.log("✅ WebSocket conectado");
		ws.onerror = (err) => console.error("❌ WebSocket error:", err);

		ws.onmessage = (ev) => {
			try {
				const msg = JSON.parse(ev.data);
				const reading = msg.payload || msg.data;
				if (msg.type === "reading" && reading?.sensorId === id) {
					setHistory((prev) => {
						const updated = [...prev, reading];
						return updated.slice(-MAX_POINTS);
					});
					updateChartData(reading);
				}
			} catch (e) {
				console.error("Error procesando WS:", e);
			}
		};

		return () => {
			ws.close();
			wsRef.current = null;
		};
	}, [id]);

	// === actualización de gráficas ===
	const updateChartData = (reading: Reading) => {
		setChartData((prev) => {
			const newData = { ...prev };
			const time = new Date(reading.timestamp).toLocaleTimeString();

			Object.entries(reading.metrics || {}).forEach(
				([category, metrics]) => {
					if (!newData[category]) newData[category] = [];

					const newPoint: any = { time };
					Object.entries(metrics).forEach(([metric, val]) => {
						const value =
							typeof val === "object" &&
							val !== null &&
							"value" in val
								? (val as any).value
								: val;
						newPoint[metric] = value;
					});

					newData[category] = [...newData[category], newPoint].slice(
						-MAX_POINTS
					);
				}
			);

			return newData;
		});
	};

	const latest = history[history.length - 1];
	const colors = [
		"#2563eb",
		"#dc2626",
		"#16a34a",
		"#f59e0b",
		"#8b5cf6",
		"#ec4899",
		"#0ea5e9",
		"#14b8a6",
	];

	// Usa el mismo campo status del reading (como en el dashboard)
	const getStatusLabel = (status?: string) => {
		if (!status) return "unknown";
		if (status === "ok") return "✅ OK";
		if (status === "warning") return "⚠️ Warning";
		if (status === "critical") return "🚨 Critical";
		return "–";
	};

	return (
		<Page>
			<Title>
				{sensorName || "Sensor"} ({id})
			</Title>
			<Sub>
				Estado actual:{" "}
				<Status status={latest?.status || "unknown"}>
					{getStatusLabel(latest?.status)}
				</Status>
			</Sub>

			{latest ? (
				<>
					{Object.entries(chartData).map(([category, data]) => (
						<Card key={category}>
							<ChartHeader>
								<h2>{category.toUpperCase()}</h2>
							</ChartHeader>
							<ResponsiveContainer width="100%" height={300}>
								<LineChart data={data}>
									<CartesianGrid
										strokeDasharray="3 3"
										stroke="#e2e8f0"
									/>
									<XAxis dataKey="time" />
									<YAxis />
									<Tooltip />
									<Legend />
									{Object.keys(
										latest.metrics[category] || {}
									).map((metric, i) => (
										<Line
											key={metric}
											type="monotone"
											dataKey={metric}
											stroke={colors[i % colors.length]}
											strokeWidth={2.5}
											dot={false}
											isAnimationActive={true}
											animationDuration={900}
											animationEasing="ease-in-out"
										/>
									))}
								</LineChart>
							</ResponsiveContainer>

							<MetricStatus>
								{Object.entries(
									latest.metrics[category] || {}
								).map(([metric, val]: [string, any], i) => (
									<Status
										key={metric}
										status={latest.status || "ok"}
										style={{
											border: `2px solid ${
												colors[i % colors.length]
											}`,
										}}>
										{metric}:{" "}
										{getStatusLabel(latest.status)}
									</Status>
								))}
							</MetricStatus>
						</Card>
					))}

					<InfoSection>
						<h2>Mantenimientos</h2>
						{maintenances.length > 0 ? (
							<ul>
								{maintenances.map((m) => (
									<li key={m.id}>
										<b>{m.status}</b> — {m.description} (
										{new Date(
											m.scheduledDate
										).toLocaleDateString()}
										)
									</li>
								))}
							</ul>
						) : (
							<p>No hay mantenimientos.</p>
						)}
					</InfoSection>

					<InfoSection>
						<h2>Fallas</h2>
						{failures.length > 0 ? (
							<ul>
								{failures.map((f) => (
									<li key={f.id}>
										<b>{f.severity}</b> — {f.description} (
										{f.status})
									</li>
								))}
							</ul>
						) : (
							<p>No se han detectado fallas.</p>
						)}
					</InfoSection>

					<InfoSection>
						<h2>Análisis</h2>
						{analysis ? (
							<CodeBox>
								{JSON.stringify(analysis.report, null, 2)}
							</CodeBox>
						) : (
							<p>No hay análisis disponibles.</p>
						)}
					</InfoSection>
				</>
			) : (
				<p>Esperando lecturas...</p>
			)}
		</Page>
	);
}
