import { useEffect, useState } from "react";
import {
	type Maintenance,
	type Failure,
	type AnalysisResponse,
} from "../../../types";
import { useReadingsStore } from "../../../store/readingState";
import { useWebSocketReadings } from "../../shared/hooks/useWebSocketReadings";
import { api } from "../../../lib/api";

const MAX_POINTS = 30;

export function useSensorDetail(id?: string) {
	const [sensorName, setSensorName] = useState<string>("");
	const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
	const [failures, setFailures] = useState<Failure[]>([]);
	const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
	const [chartData, setChartData] = useState<Record<string, any[]>>({});

	const sensorMap = useReadingsStore((s) => s.sensorMap);

	useWebSocketReadings({ filterSensorId: id });

	useEffect(() => {
		if (!id) return;

		const loadBaseData = async () => {
			try {
				const sensor = await api.getSensor(String(id));
				setSensorName(sensor.name);

				const [maints, fails, anal] = await Promise.all([
					api.getMaintenances(),
					api.getFailures(),
					api.analyzeData([String(id)]),
				]);

				setMaintenances(maints.filter((m) => m.sensorId === sensor.id));
				setFailures(fails.filter((f) => f.sensorId === sensor.id));
				setAnalysis(anal);
			} catch (err) {
				console.error("Error cargando datos base:", err);
			}
		};

		loadBaseData();
	}, [id]);

	const history = sensorMap.get(String(id)) || [];

	useEffect(() => {
		if (history.length === 0) return;

		const newChartData: Record<string, any[]> = {};

		history.forEach((reading) => {
			const time =
				typeof reading.timestamp === "string"
					? new Date(reading.timestamp).toLocaleTimeString()
					: new Date(Number(reading.timestamp)).toLocaleTimeString();

			Object.entries(reading.metrics || {}).forEach(([category, metrics]) => {
				if (!newChartData[category]) newChartData[category] = [];

				const point: any = { time };
				Object.entries(metrics).forEach(([metric, val]) => {
					const value =
						typeof val === "object" && val !== null && "value" in val
							? (val as any).value
							: val;
					point[metric] = value;
				});

				newChartData[category].push(point);
			});
		});

		Object.keys(newChartData).forEach((key) => {
			newChartData[key] = newChartData[key].slice(-MAX_POINTS);
		});

		setChartData(newChartData);
	}, [history]);

	const latest = history[history.length - 1];

	return {
		sensorName,
		maintenances,
		failures,
		analysis,
		chartData,
		latest,
	};
}
