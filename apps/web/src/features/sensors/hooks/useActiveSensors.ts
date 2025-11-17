import { useEffect, useState } from "react";
import { useReadingsStore } from "../../../store/readingState";
import type { Sensor } from "../../../types";

export function useActiveSensors(sensors: Sensor[]) {
	const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});
	const sensorMap = useReadingsStore((s) => s.sensorMap);
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 5000);
		return () => clearInterval(id);
	}, []);

	useEffect(() => {
		if (!sensors.length) return;

		const newMap: Record<string, boolean> = {};

		sensors.forEach((sensor) => {
			const key = (sensor as any).sensorId ?? sensor.id;
			const readings = sensorMap.get(key);
			if (!readings?.length) return;

			const last = readings[readings.length - 1];
			if (!last?.timestamp) return;

			const ts =
				typeof last.timestamp === "string"
					? Date.parse(last.timestamp)
					: Number(last.timestamp);

			if (Number.isNaN(ts)) return;

			newMap[key] = now - ts < 30000; // 30s active window
		});

		setActiveMap(newMap);
	}, [sensors, sensorMap, now]);

	return activeMap;
}
