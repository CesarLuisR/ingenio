import { useEffect, useState } from "react";
import { subscribeToStatus } from "../../../lib/wsReadingsClient";

export function useDashboardStatus() {
	const [status, setStatus] = useState<"connecting" | "connected" | "closed">("connecting");

	useEffect(() => {
		// escuchamos al WebSocket global
		const unsub = subscribeToStatus(setStatus);
		return () => unsub();
	}, []);

	return status;
}
