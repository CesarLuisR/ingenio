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

	useEffect(() => {
		(async () => {
			try {
				const data = await api.getSensors();

				const enriched = data.map((sensor) => {
					const readings = sensorMap.get(sensor.id.toString());
					if (!readings || readings.length === 0)
						return { ...sensor, active: false };

					const last = readings[readings.length - 1];
					const lastTime = typeof last.timestamp === "string"
						? new Date(last.timestamp).getTime()
						: Number(last.timestamp);

					const active = Date.now() - lastTime < 30_000;

					return {
						...sensor,
						active,
						lastReadingTime: lastTime,
						lastStatus: last.status,
					};
				});

				setSensors(enriched);
			} catch (e) {
				console.error("Error cargando sensores:", e);
			} finally {
				setLoading(false);
			}
		})();
	}, [sensorMap]);

	return { sensors, loading };
}
