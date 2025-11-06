import { useEffect, useState } from "react";

export function useDashboardStatus(wsUrl: string) {
	const [status, setStatus] = useState<
		"connecting" | "connected" | "closed"
	>("connecting");

	useEffect(() => {
		let ws: WebSocket;
		let reconnectTimeout: NodeJS.Timeout | null = null;

		function connect() {
			setStatus("connecting");
			ws = new WebSocket(wsUrl);

			ws.onopen = () => setStatus("connected");
			ws.onerror = () => setStatus("closed");
			ws.onclose = () => {
				setStatus("closed");
				reconnectTimeout = setTimeout(connect, 3000);
			};
		}

		connect();

		return () => {
			if (reconnectTimeout) clearTimeout(reconnectTimeout);
			ws.close();
		};
	}, [wsUrl]);

	return status;
}
