import type { Reading } from "../types"; 

type ReadingListener = (reading: Reading) => void;

let socket: WebSocket | null = null;
let reconnectTimeout: number | null = null;
let reconnectAttempt = 0;

const listeners = new Set<ReadingListener>();

// export function getWsUrl(): string {
//     // 1. Detectar si la web se cargó por HTTP o HTTPS (para usar ws o wss)
//     const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

//     // 2. Obtener el hostname actual automáticamente
//     // Si entras por localhost, esto vale "localhost"
//     // Si entras por 192.168.1.15, esto vale "192.168.1.15"
//     const host = window.location.hostname;

//     // 3. Definir el puerto del backend
//     // NOTA: En tu código anterior usabas el 3000. 
//     // Si cambiaste al 5000, déjalo así. Si no, cámbialo a 3000.
//     const port = "5000"; 

//     return `${protocol}//${host}:${port}/ws`;
// }

export function getWsUrl(): string {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;

    // Localhost (dev normal)
    if (host === "localhost" || host === "127.0.0.1") {
        return `${protocol}//localhost:5000/ws`;
    }

    // LAN (10.x.x.x , 192.168.x.x)
    if (/^(10\.|192\.168\.)/.test(host)) {
        // Usa exactamente la IP desde donde entró el usuario
        return `${protocol}//${host}:5000/ws`;
    }

    // Todavía no manejamos producción aquí
    return `${protocol}//${host}:5000/ws`;
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
