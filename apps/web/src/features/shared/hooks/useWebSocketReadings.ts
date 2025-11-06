// useWebSocketReadings.ts
import { useEffect, useRef } from "react";
import { useReadingsStore } from "../../../store/readingState";
import type { Reading } from "../../../lib/api";

interface Options {
	filterSensorId?: string; // opcional — si se pasa, solo procesa ese sensor
	reconnectDelay?: number; // opcional — por defecto 3000 ms
}

export function useWebSocketReadings({
	filterSensorId,
	reconnectDelay = 3000,
}: Options = {}) {
	const addReading = useReadingsStore((s) => s.addReading);
	const wsRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		let retryTimeout: NodeJS.Timeout | null = null;

		const connect = () => {
			const wsUrl =
				window.location.hostname === "localhost"
					? "ws://localhost:5000/ws"
					: "ws://api:5000/ws";

			console.log("🌐 Conectando WebSocket:", wsUrl);
			const ws = new WebSocket(wsUrl);
			wsRef.current = ws;

			ws.onopen = () => console.log("✅ WebSocket conectado");
			ws.onerror = (err) => console.error("❌ Error en WebSocket:", err);

			ws.onmessage = (event) => {
				try {
					const msg = JSON.parse(event.data);
					if (msg.type === "reading") {
						const reading: Reading = msg.payload || msg.data;
						if (!reading || !reading.sensorId) return;

						// si hay filtro de sensorId, lo aplicamos
						if (!filterSensorId || reading.sensorId === filterSensorId) {
							addReading(reading);
						}
					}
				} catch (err) {
					console.error("Error procesando mensaje WS:", err);
				}
			};

			ws.onclose = () => {
				console.warn("🔴 WebSocket cerrado. Reintentando en", reconnectDelay, "ms...");
				retryTimeout = setTimeout(connect, reconnectDelay);
			};
		};

		connect();

		return () => {
			if (retryTimeout) clearTimeout(retryTimeout);
			if (wsRef.current) wsRef.current.close();
			wsRef.current = null;
		};
	}, [filterSensorId, reconnectDelay, addReading]);
}
