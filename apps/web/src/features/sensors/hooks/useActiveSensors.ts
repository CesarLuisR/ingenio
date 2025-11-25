import { useEffect, useState } from "react";
import { useReadingsStore } from "../../../store/readingState";
import type { Sensor } from "../../../types";

export function useActiveSensors(sensors: Sensor[]) {
    const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});
    const sensorMap = useReadingsStore((s) => s.sensorMap);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (!sensors.length) return;

        const newMap: Record<string, boolean> = {};

        sensors.forEach((sensor) => {
            const key = (sensor as any).sensorId ?? sensor.id;
            
            // A. Obtener Configuración de Tiempo
            const config = sensor.config as any;
            // Intervalo configurado (default 60s si no existe)
            const configuredInterval = config?.intervalMs ? Number(config.intervalMs) : 60000;
            // Tolerancia 2.5x (Si reporta cada 10s, muere a los 25s)
            const threshold = Math.max(configuredInterval * 2.5, 10000); 

            // B. Determinar la última vez que se vio
            let lastTime = 0;
            const readings = sensorMap.get(key);

            if (readings && readings.length > 0) {
                // 1. Prioridad: Store de WebSockets (Tiempo real)
                const last = readings[readings.length - 1];
                lastTime = typeof last.timestamp === "string" 
                    ? Date.parse(last.timestamp) 
                    : Number(last.timestamp);
            } else if ((sensor as any).lastSeen) {
                // 2. Fallback: Base de datos (Carga inicial)
                lastTime = new Date((sensor as any).lastSeen).getTime();
            }

            // C. Calcular Estado
            if (!lastTime || isNaN(lastTime)) {
                newMap[key] = false; // Nunca visto
            } else {
                const elapsed = now - lastTime;
                newMap[key] = elapsed < threshold;
            }
        });

        setActiveMap(newMap);
    }, [sensors, sensorMap, now]);

    return activeMap;
}