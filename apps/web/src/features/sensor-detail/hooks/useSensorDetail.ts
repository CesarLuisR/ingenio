import { useEffect, useRef, useState } from "react";
import {
  api,
  type Reading,
  type Maintenance,
  type Failure,
  type AnalysisResponse,
} from "../../../lib/api";
import { useReadingsStore } from "../../../store/readingState";

const MAX_POINTS = 30;

export function useSensorDetail(id?: string) {
  const [sensorName, setSensorName] = useState<string>("");
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [failures, setFailures] = useState<Failure[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [chartData, setChartData] = useState<Record<string, any[]>>({});
  const wsRef = useRef<WebSocket | null>(null);

  const addReading = useReadingsStore((s) => s.addReading);
  const sensorMap = useReadingsStore((s) => s.sensorMap);

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

  useEffect(() => {
    if (!id) return;

    const wsUrl =
      window.location.hostname === "localhost"
        ? "ws://localhost:5000/ws"
        : "ws://api:5000/ws";

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => console.log("✅ WebSocket conectado (detalle sensor)");
    ws.onerror = (err) => console.error("❌ WebSocket error:", err);

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        const reading: Reading = msg.payload || msg.data;
        if (msg.type === "reading" && reading?.sensorId === id) {
          addReading(reading);
        }
      } catch (e) {
        console.error("Error procesando WS:", e);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [id, addReading]);

  const history = sensorMap.get(String(id)) || [];

  useEffect(() => {
    if (history.length === 0) return;

    const newChartData: Record<string, any[]> = {};

    history.forEach((reading) => {
      const time =
        typeof reading.timestamp === "string"
          ? new Date(reading.timestamp).toLocaleTimeString()
          : new Date(Number(reading.timestamp)).toLocaleTimeString();

      Object.entries(reading.metrics || {}).forEach(
        ([category, metrics]) => {
          if (!newChartData[category]) newChartData[category] = [];

          const point: any = { time };
          Object.entries(metrics).forEach(([metric, val]) => {
            const value =
              typeof val === "object" &&
                val !== null &&
                "value" in val
                ? (val as any).value
                : val;
            point[metric] = value;
          });

          newChartData[category].push(point);
        }
      );
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
