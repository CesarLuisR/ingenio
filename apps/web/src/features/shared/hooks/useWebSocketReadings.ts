// useWebSocketReadings.ts
import { useEffect } from "react";
import { useReadingsStore } from "../../../store/readingState";
import type { Reading } from "../../../types";
import { subscribeToReadings } from "../../../lib/wsReadingsClient";

interface Options {
	filterSensorId?: string; // opcional — solo procesa un sensor si se pasa
}

export function useWebSocketReadings({ filterSensorId }: Options = {}) {
	const addReading = useReadingsStore((s) => s.addReading);

	useEffect(() => {
		const unsubscribe = subscribeToReadings((reading: Reading) => {
			if (!reading || !reading.sensorId) return;

			if (!filterSensorId || reading.sensorId === filterSensorId) {
				addReading(reading);
			}
		});

		return () => {
			unsubscribe();
		};
	}, [filterSensorId, addReading]);
}
