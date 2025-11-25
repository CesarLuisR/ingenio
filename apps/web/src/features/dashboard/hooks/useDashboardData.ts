import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { type Sensor } from "../../../types";
import { useReadingsStore } from "../../../store/readingState";

export interface SensorWithStatus extends Sensor {
    active: boolean;
    lastReadingTime?: number;
    lastStatus?: string;
}

export function useDashboardData() {
    const sensorMap = useReadingsStore((s) => s.sensorMap);
    const [sensors, setSensors] = useState<SensorWithStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(Date.now());

    // Reloj para actualizar estado "active" visualmente cada segundo
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                // Solo llamamos a la API si es la carga inicial
                // (Para evitar llamadas infinitas, idealmente esto se cachea)
                if (sensors.length === 0) {
                    const data = await api.getSensors();
                    if (!isMounted) return;
                    
                    // Inicializamos la estructura básica
                    const initialMap = data.map(s => ({
                        ...s,
                        active: false, // Se calculará abajo
                        lastReadingTime: s.lastSeen ? new Date(s.lastSeen).getTime() : undefined
                    }));
                    setSensors(initialMap);
                    setLoading(false);
                }
            } catch (e) {
                console.error(e);
                if (isMounted) setLoading(false);
            }
        })();

        return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Solo al montar

    // EFECTO: Sincronizar datos del Store con la lista de sensores
    useEffect(() => {
        if (sensors.length === 0) return;

        setSensors(prevSensors => {
            return prevSensors.map(sensor => {
                // CRÍTICO: Usar la misma key que usa el WebSocket (sensorId)
                const key = sensor.sensorId ?? String(sensor.id);
                const readings = sensorMap.get(key);

                // 1. Configuración de umbral (Default 60s, Tolerancia 2.5x)
                const config = sensor.config as any;
                const configuredInterval = config?.intervalMs ? Number(config.intervalMs) : 60000;
                const threshold = Math.max(configuredInterval * 2.5, 15000); // Minimo 15s

                // 2. Buscar la lectura más reciente (Store vs Estado previo)
                let lastTime = sensor.lastReadingTime;
                let lastStatus = sensor.lastStatus;

                if (readings && readings.length > 0) {
                    const last = readings[readings.length - 1];
                    const storeTime = typeof last.timestamp === "string" 
                        ? new Date(last.timestamp).getTime() 
                        : Number(last.timestamp);
                    
                    // Solo actualizamos si la del store es más nueva
                    if (!lastTime || storeTime > lastTime) {
                        lastTime = storeTime;
                        lastStatus = last.status;
                    }
                }

                // 3. Calcular si está activo AHORA mismo
                const isActive = lastTime ? (now - lastTime < threshold) : false;

                // Optimización: Si nada cambió, devolver la misma referencia (React performance)
                if (sensor.active === isActive && sensor.lastReadingTime === lastTime) {
                    return sensor;
                }

                return {
                    ...sensor,
                    active: isActive,
                    lastReadingTime: lastTime,
                    lastStatus: lastStatus,
                };
            });
        });
    }, [sensorMap, now]); // Se ejecuta cada segundo (now) o cuando llegan datos (sensorMap)

    return { sensors, loading };
}