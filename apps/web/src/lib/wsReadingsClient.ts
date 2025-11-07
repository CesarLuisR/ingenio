import type { Reading } from "../types"; 

type ReadingListener = (reading: Reading) => void;

let socket: WebSocket | null = null;
let reconnectTimeout: number | null = null;
let reconnectAttempt = 0;

const listeners = new Set<ReadingListener>();

function getWsUrl(): string {
	// Same logic you had in the hook
	if (window.location.hostname === "localhost") {
		return "ws://localhost:5000/ws";
	}
	return "ws://api:5000/ws";
}

function handleMessage(event: MessageEvent) {
	try {
		const msg = JSON.parse(event.data);
		if (msg.type !== "reading") return;

		const reading: Reading = msg.payload || msg.data;
		if (!reading || !reading.sensorId) return;

		for (const listener of listeners) {
			listener(reading);
		}
	} catch (err) {
		console.error("Error procesando mensaje WS:", err);
	}
}

function scheduleReconnect() {
	if (reconnectTimeout !== null) return; // ya hay un retry en curso

	reconnectAttempt += 1;
	const baseDelay = 3000; // 3s
	const maxDelay = 15000; // 15s
	const delay = Math.min(baseDelay * reconnectAttempt, maxDelay);

	console.warn(`🔴 WebSocket cerrado. Reintentando en ${delay} ms...`);

	reconnectTimeout = window.setTimeout(() => {
		reconnectTimeout = null;
		connect();
	}, delay);
}

function connect() {
	const url = getWsUrl();
	console.log("🌐 Conectando WebSocket global:", url);

	const ws = new WebSocket(url);
	socket = ws;

	ws.onopen = () => {
		reconnectAttempt = 0;
		console.log("✅ WebSocket global conectado");
	};

	ws.onerror = (err) => {
		console.error("❌ Error en WebSocket global:", err);
	};

	ws.onmessage = handleMessage;

	ws.onclose = () => {
		// Si todavía hay listeners, intentamos reconectar
		if (listeners.size > 0) {
			scheduleReconnect();
		} else {
			console.log("🔌 WebSocket cerrado y sin listeners, no se reconecta.");
		}
	};
}

export function startReadingsSocket() {
	// Si no hay socket o está cerrado, conectamos
	if (!socket || socket.readyState === WebSocket.CLOSED) {
		connect();
	}
}

/**
 * Suscribe un listener a las lecturas.
 * Devuelve una función para desuscribirse.
 */
export function subscribeToReadings(listener: ReadingListener): () => void {
	listeners.add(listener);
	startReadingsSocket();

	return () => {
		listeners.delete(listener);

		// Si ya nadie escucha, cerramos conexión y limpiamos retry
		if (listeners.size === 0) {
			if (reconnectTimeout !== null) {
				clearTimeout(reconnectTimeout);
				reconnectTimeout = null;
			}
			if (socket) {
				console.log("🧹 Cerrando WebSocket global (sin listeners)...");
				socket.close();
				socket = null;
			}
		}
	};
}
