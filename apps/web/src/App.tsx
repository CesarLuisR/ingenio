import { useEffect, useState, useRef } from "react";

interface MetricInfo {
	value: number;
	status: "ok" | "low" | "high" | "unknown";
}

interface MetricsMap {
	[category: string]: {
		[metric: string]: MetricInfo;
	};
}

interface Reading {
	sensorId: string;
	timestamp: string;
	status: "ok" | "warning" | "critical" | "unknown";
	metrics: MetricsMap;
	totalIssues: number;
	severityLevel: number;
}

interface WSMessage {
	type: string;
	payload?: Reading;
	data?: Reading;
}

export default function App() {
	const [readings, setReadings] = useState<Reading[]>([]);
	const [status, setStatus] = useState<"connecting" | "connected" | "closed">(
		"connecting"
	);
	const wsRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		const ws = new WebSocket("ws://localhost:5000/ws");
		wsRef.current = ws;

		ws.onopen = () => setStatus("connected");
		ws.onclose = () => setStatus("closed");
		ws.onerror = (err) => console.error("WebSocket error:", err);

		ws.onmessage = (ev) => {
			try {
				const msg: WSMessage = JSON.parse(ev.data);
				const reading = msg.payload || msg.data;

				if (msg.type === "reading" && reading) {
					setReadings((prev) => [reading, ...prev.slice(0, 50)]);
				}
			} catch (err) {
				console.error("Error parsing WS message:", err);
			}
		};

		return () => ws.close();
	}, []);

	const getStatusEmoji = (s: string) => {
		switch (s) {
			case "critical":
				return "🚨";
			case "warning":
				return "⚠️";
			case "ok":
				return "✅";
			default:
				return "❔";
		}
	};

	const connectionEmoji =
		status === "connected" ? "🟢" : status === "connecting" ? "🟡" : "🔴";

	return (
		<main className="min-h-screen bg-gray-100 font-sans p-8">
			<header className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-semibold text-gray-900">
						📡 Ingenio Dashboard
					</h1>
					<p
						className={`mt-1 flex items-center gap-2 text-sm font-medium ${
							status === "connected"
								? "text-green-600"
								: "text-red-600"
						}`}>
						<span>{connectionEmoji}</span>
						{status === "connected"
							? "Conectado al servidor"
							: status === "connecting"
							? "Conectando..."
							: "Desconectado"}
					</p>
				</div>

				<div className="bg-white rounded-lg px-4 py-2 shadow text-sm text-gray-700">
					<span className="font-semibold">
						{readings.length || 0}
					</span>{" "}
					lecturas recibidas
				</div>
			</header>

			{readings.length === 0 ? (
				<p className="text-gray-500 italic text-center mt-12">
					Esperando lecturas de sensores...
				</p>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{readings
						.filter(
							(r): r is Reading =>
								r !== undefined &&
								r.sensorId != "" &&
								r.status !== undefined
						)
						.map((r, i) => (
							<div
								key={i}
								className={`p-5 rounded-xl shadow-sm bg-white border-l-4 transition-all duration-200 hover:shadow-md ${
									r.status === "critical"
										? "border-red-500"
										: r.status === "warning"
										? "border-yellow-400"
										: "border-green-500"
								}`}>
								<div className="flex justify-between items-center mb-3">
									<div>
										<h2 className="font-semibold text-gray-800 text-lg">
											{r.sensorId}
										</h2>
										<p className="text-gray-500 text-xs">
											{new Date(
												r.timestamp
											).toLocaleTimeString()}
										</p>
									</div>
									<span className="text-2xl">
										{getStatusEmoji(r.status)}
									</span>
								</div>

								<div className="text-sm text-gray-700 space-y-1">
									{Object.entries(r.metrics || {}).map(
										([cat, metrics]) => (
											<div key={cat}>
												<strong className="text-gray-800">
													{cat}
												</strong>
												:{" "}
												{Object.entries(metrics)
													.map(
														([m, v]) =>
															`${m}: ${v.value} ${
																v.status !==
																"ok"
																	? `(${v.status.toUpperCase()})`
																	: ""
															}`
													)
													.join(", ")}
											</div>
										)
									)}
								</div>

								<div className="mt-3 text-sm flex justify-between items-center">
									<div>
										<span className="text-gray-600">
											Estado:
										</span>{" "}
										<span
											className={
												r.status === "critical"
													? "text-red-600 font-semibold"
													: r.status === "warning"
													? "text-yellow-600 font-semibold"
													: "text-green-600 font-semibold"
											}>
											{r.status.toUpperCase()}
										</span>
									</div>
									<span className="text-gray-500 text-xs">
										{r.totalIssues ?? 0}{" "}
										{r.totalIssues === 1
											? "alerta"
											: "alertas"}
									</span>
								</div>
							</div>
						))}
				</div>
			)}
		</main>
	);
}
