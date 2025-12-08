import { createContext, useContext } from "react";
import { useWebSocketReadings } from "../../features/shared/hooks/useWebSocketReadings";

const WSContext = createContext(true);

export function GlobalWebSocketProvider({ children }: { children: React.ReactNode }) {
	useWebSocketReadings(); // solo 1 instancia global

	return <WSContext.Provider value={true}>{children}</WSContext.Provider>;
}

export function useWSGlobal() {
	return useContext(WSContext);
}
