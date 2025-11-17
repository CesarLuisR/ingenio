import { useEffect } from "react";
import { useReadingsStore } from "../../../store/readingState";
import type { Reading } from "../../../types";
import { subscribeToReadings } from "../../../lib/wsReadingsClient";

interface Options {
	filterSensorId?: string;
}

export function useWebSocketReadings({ filterSensorId }: Options = {}) {

	console.log("WS-HOOK-MONTADO =>", filterSensorId);

	useEffect(() => {
		console.log("WS-EFFECT-CREADO =>", filterSensorId);

		const addReading = useReadingsStore.getState().addReading;

		const unsubscribe = subscribeToReadings((reading: Reading) => {
			console.log("WS-LISTA-PROCESANDO =>", reading.sensorId);
			if (!filterSensorId || reading.sensorId === filterSensorId) {
				addReading(reading);
			}
		});

		return () => {
			console.log("WS-EFFECT-DESMONTADO =>", filterSensorId);
			unsubscribe();
		};
	}, [filterSensorId]);
}

