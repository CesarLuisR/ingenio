import { useEffect, useState } from "react";
import { useReadingsStore } from "../../../store/readingState";
import { api } from "../../../lib/api";
import { type Machine, type Failure } from "../../../types";
import type { NavigateFunction } from "react-router-dom";

const MAX_POINTS = 30;

export function useSensorDetail(id: number, navigate: NavigateFunction) {
    const [sensorName, setSensorName] = useState<string>("");
    const [sensorStrId, setSensorStrId] = useState<string | null>(null);
    const [machine, setMachine] = useState<Machine | null>(null);

    // Restauramos el estado para fallas
    const [failures, setFailures] = useState<Failure[]>([]);
    const [chartData, setChartData] = useState<Record<string, any[]>>({});
    const sensorMap = useReadingsStore((s) => s.sensorMap);

    // 🔹 1. Cargar datos estáticos del sensor y sus fallas históricas
    useEffect(() => {
        if (!id) return;

        let mounted = true;

        const loadBaseData = async () => {
            try {
                // 1. Obtenemos el sensor para saber su ID numérico interno
                const sensor = await api.getSensor(id);
                const machine = await api.getMachine(sensor.machineId);

                if (mounted) {
                    setSensorName(sensor.name);
                    setSensorStrId(sensor.sensorId);

                    // 2. Cargamos las fallas y filtramos por este sensor
                    // (Idealmente el backend debería tener getFailures({ sensorId: ... }), 
                    // pero mantenemos la lógica de filtrado que tenías)
                    const allFailures = await api.failures.getList();
                    const sensorFailures = allFailures.filter(f => f.sensorId === sensor.id);

                    setMachine(machine);
                    setFailures(sensorFailures);
                }
            } catch (err) {
                console.error("❌ Error cargando datos base del sensor:", err);
            }
        };

        loadBaseData();

        return () => { mounted = false; };
    }, [id]);

    // 🔹 2. Historial reactivo (WebSockets/Store)
    const history = sensorMap.get(sensorStrId || "") || [];

    // 🔹 3. Transformación para gráficas
    useEffect(() => {
        if (history.length === 0) return;

        const newChartData: Record<string, any[]> = {};

        history.forEach((reading) => {
            const time = typeof reading.timestamp === "string"
                ? new Date(reading.timestamp).toLocaleTimeString()
                : new Date(Number(reading.timestamp)).toLocaleTimeString();

            Object.entries(reading.metrics || {}).forEach(([category, metrics]) => {
                if (!newChartData[category]) newChartData[category] = [];

                const point: Record<string, any> = { time };

                Object.entries(metrics).forEach(([metric, val]) => {
                    const value = typeof val === "object" && val !== null && "value" in val
                        ? (val as any).value
                        : val;
                    point[metric] = value;
                });

                newChartData[category].push(point);
            });
        });

        // Limitar puntos
        for (const key of Object.keys(newChartData)) {
            newChartData[key] = newChartData[key].slice(-MAX_POINTS);
        }

        setChartData(newChartData);
    }, [history]);

    const latest = history.at(-1);

    const handleViewReport = () => {
        // Solo navegamos si hay datos guardados
        if (!machine || !machine.lastAnalysis) return;

        // Estructura compatible con MachineAnalysisResponse
        const preloadedResult = {
            machine: {
                id: machine.id,
                name: machine.name,
                code: machine.code
            },
            analysis: machine.lastAnalysis
        };

        // Navegamos a /analisis pasando el objeto en el state
        navigate("/analisis", { state: { preloadedResult } });
    };

    return {
        sensorName,
        failures, // ✅ Aquí está de vuelta
        chartData,
        latest,
        handleViewReport,
        lastAnalysis: !!machine?.lastAnalysis
    };
}