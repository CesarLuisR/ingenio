import type { Reading } from "../types"; 

type ReadingListener = (reading: Reading) => void;

let socket: WebSocket | null = null;
let reconnectTimeout: number | null = null;
let reconnectAttempt = 0;

const listeners = new Set<ReadingListener>();

export function getWsUrl(): string {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // 1. Validación de seguridad para no romper la app
    if (!apiUrl) {
        console.error("VITE_API_URL no está definida");
        return ""; 
    }

    try {
        // 2. Usar el constructor URL para parsear
        const url = new URL(apiUrl);

        // 3. Determinar protocolo basado en la API, no en la ventana
        // Si la API es https, el socket debe ser wss. Si es http, ws.
        url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

        // 4. Ajustar el pathname (manteniendo subrutas si existen o reemplazando)
        // Opción A: Reemplazar todo el path con /ws
        url.pathname = "/ws";
        
        // Opción B (Si tu API es /api/v1 y el socket es /api/v1/ws):
        // url.pathname = url.pathname.replace(/\/$/, "") + "/ws";

        return url.toString();

    } catch (error) {
        console.error("Error construyendo WS URL:", error);
        return "";
    }
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
		emitStatus("connected")
		console.log("✅ WebSocket global conectado");
	};

	ws.onerror = (err) => {
		emitStatus("closed")
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

		emitStatus("closed")
	};
}

export function startReadingsSocket() {
	// Si no hay socket o está cerrado, conectamos
	if (!socket || socket.readyState === WebSocket.CLOSED) {
		connect();
	}
}

let connectionStatus: "connecting" | "connected" | "closed" = "connecting";
let statusListeners: ((s: typeof connectionStatus) => void)[] = [];

export function subscribeToStatus(listener: (s: typeof connectionStatus) => void) {
	statusListeners.push(listener);
	// enviar estado actual por si ya está conectado
	listener(connectionStatus);

	return () => {
		statusListeners = statusListeners.filter(l => l !== listener);
	};
}

export function emitStatus(s: typeof connectionStatus) {
	connectionStatus = s;
	statusListeners.forEach(fn => fn(s));
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
