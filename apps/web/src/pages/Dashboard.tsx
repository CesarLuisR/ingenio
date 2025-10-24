"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { type Reading } from "../lib/api";

// === estilos ===
const Container = styled.div`
	padding: 2rem;
	background-color: #f3f4f6;
	min-height: 100vh;
`;

const Title = styled.h1`
	font-size: 1.875rem;
	font-weight: bold;
	color: #111827;
	margin-bottom: 2rem;
`;

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 1.5rem;
`;

const Card = styled.div`
	background-color: white;
	border-radius: 12px;
	padding: 16px;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
	cursor: pointer;
	transition: transform 0.2s ease, box-shadow 0.2s ease;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
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

const Empty = styled.div`
	background-color: white;
	border-radius: 8px;
	padding: 3rem;
	text-align: center;
	color: #6b7280;
	font-size: 1.125rem;
`;

// === componente ===
export default function Dashboard() {
	const [connectedSensors, setConnectedSensors] = useState<
		Record<string, Reading>
	>({});
	const [status, setStatus] = useState<"connecting" | "connected" | "closed">(
		"connecting"
	);
	const wsRef = useRef<WebSocket | null>(null);

	// --- conexión websocket ---
	useEffect(() => {
		const wsUrl =
			window.location.hostname === "localhost"
				? "ws://localhost:5000/ws"
				: "ws://api:5000/ws";

		console.log("🌐 Conectando a WebSocket:", wsUrl);
		const ws = new WebSocket(wsUrl);
		wsRef.current = ws;

		ws.onopen = () => {
			console.log("✅ WebSocket conectado");
			setStatus("connected");
		};

		ws.onclose = () => {
			console.log("🔴 Conexión cerrada. Reintentando en 3s...");
			setStatus("closed");
			setTimeout(() => {
				if (
					!wsRef.current ||
					wsRef.current.readyState === WebSocket.CLOSED
				) {
					console.log("🔁 Reintentando conexión WebSocket...");
					wsRef.current = null;
					setStatus("connecting");
					// reinicia
					const reconnect = new WebSocket(wsUrl);
					wsRef.current = reconnect;
				}
			}, 3000);
		};

		ws.onerror = (err) => {
			console.error("❌ Error en WebSocket:", err);
		};

		ws.onmessage = (event) => {
			try {
				const msg = JSON.parse(event.data);
				if (msg.type === "reading") {
					const reading: Reading = msg.payload || msg.data;
					if (!reading || !reading.sensorId) return;

					// Mostrar lectura entrante en consola
					console.log("📡 Nueva lectura recibida:", reading);

					// Actualizar dashboard dinámico
					setConnectedSensors((prev) => ({
						...prev,
						[reading.sensorId]: reading,
					}));
				}
			} catch (err) {
				console.error("Error parseando mensaje WS:", err);
			}
		};

		return () => {
			ws.close();
			wsRef.current = null;
		};
	}, []);

	const sensorsArray = Object.values(connectedSensors);

	return (
		<Container>
			<Title>
				Dashboard en Tiempo Real{" "}
				{status === "connected"
					? "🟢"
					: status === "connecting"
					? "🟡"
					: "🔴"}
			</Title>

			{sensorsArray.length === 0 ? (
				<Empty>Esperando lecturas de sensores conectados...</Empty>
			) : (
				<Grid>
					{sensorsArray.map((reading) => (
						<Link
							key={reading.sensorId}
							to={`/sensor/${reading.sensorId}`}
							style={{ textDecoration: "none" }}>
							<Card>
								<h2
									style={{
										fontSize: "1.25rem",
										fontWeight: 600,
									}}>
									{reading.sensorId}
								</h2>

								<p
									style={{
										color: "#6b7280",
										marginBottom: "0.5rem",
									}}>
									Última actualización:{" "}
									{new Date(
										reading.timestamp
									).toLocaleTimeString()}
								</p>

								<Status status={reading.status}>
									{reading.status.toUpperCase()}
								</Status>

								<p
									style={{
										fontSize: "0.875rem",
										color: "#9ca3af",
										marginTop: "0.5rem",
									}}>
									Total de métricas:{" "}
									{Object.keys(reading.metrics || {}).length}
								</p>

								<p
									style={{
										fontSize: "0.875rem",
										color: "#9ca3af",
										marginTop: "0.25rem",
									}}>
									Severidad: {reading.severityLevel} | Issues:{" "}
									{reading.totalIssues}
								</p>
							</Card>
						</Link>
					))}
				</Grid>
			)}
		</Container>
	);
}
