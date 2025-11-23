import { type AnalysisResponse, type SensorReport, type ChartData, type MetricAnalysis, type ChartPoint } from "../../types/analysisTypes";
import { type IMachineData, type ConfigData } from "../../types/sensorTypes"; 

export function analyzeSensorData(data: IMachineData[]): AnalysisResponse {
    
    // Validación de entrada
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No se recibieron datos válidos para analizar");
    }

    const report: SensorReport[] = data.map((machine) => {
        const { config, readings } = machine;
        // Casteamos config asumiendo que viene correcto, o podrías validarlo antes
        const { metricsConfig } = config as unknown as ConfigData; 

        const metricReport: Record<string, Record<string, MetricAnalysis | { message: string }>> = {};
        const chartData: ChartData = {};

        // Si no hay configuración de métricas, saltamos este sensor
        if (!metricsConfig) {
            return {
                sensorId: (config as any).sensorId || "unknown",
                resumen: {},
                chartData: {}
            };
        }

        // Recorremos cada grupo de métricas (electrical, mechanical, etc.)
        for (const category of Object.keys(metricsConfig)) {
            metricReport[category] = {};
            chartData[category] = [];

            for (const metricName of Object.keys(metricsConfig[category])) {
                // Tomamos todos los puntos válidos
                const points = readings
                    .map((r) => {
                        const value = r?.metrics?.[category]?.[metricName];
                        if (typeof value !== "number" || isNaN(value)) return null;
                        return {
                            x: new Date(r.timestamp).getTime(),
                            y: value,
                        };
                    })
                    .filter(
                        (p): p is { x: number; y: number } =>
                            p !== null && typeof p.y === "number"
                    );

                if (points.length < 2) {
                    metricReport[category][metricName] = {
                        message: "No hay suficientes datos para análisis",
                    };
                    continue;
                }

                // --- Cálculo de regresión lineal simple ---
                const n = points.length;
                const x0 = points[0].x;

                // Normalizar tiempo en horas desde el inicio para evitar números gigantes en X
                const normalized = points.map((p) => ({
                    x: (p.x - x0) / (1000 * 60 * 60),
                    y: p.y,
                }));

                const meanX = normalized.reduce((a, p) => a + p.x, 0) / n;
                const meanY = normalized.reduce((a, p) => a + p.y, 0) / n;

                const numerator = normalized.reduce(
                    (s, p) => s + (p.x - meanX) * (p.y - meanY),
                    0
                );
                const denominator = normalized.reduce(
                    (s, p) => s + (p.x - meanX) ** 2,
                    0
                );

                const slope = denominator !== 0 ? numerator / denominator : 0; // cambio por hora
                
                const currentValue = points[n - 1].y;
                const { min, max } = metricsConfig[category][metricName];

                // --- Determinar tendencia ---
                const threshold = Math.abs(meanY) * 0.005; // 0.5% del valor medio por hora
                let trend: "subiendo" | "bajando" | "estable";
                
                if (Math.abs(slope) < threshold) trend = "estable";
                else if (slope > 0) trend = "subiendo";
                else trend = "bajando";

                // --- Evaluar urgencia ---
                let urgency: MetricAnalysis["urgencia"] = "normal";
                
                if (typeof min === "number" && typeof max === "number") {
                    if (currentValue > max || currentValue < min) {
                        urgency = "🚨 fuera de rango";
                    } else {
                        const range = max - min;
                        const distanceToMax = max - currentValue;
                        const distanceToMin = currentValue - min;
                        const minDistance = Math.min(distanceToMax, distanceToMin);
                        const proximityRatio = minDistance / range;

                        if (proximityRatio <= 0.1) {
                            urgency = "⚠️ muy alta";
                        } else if (proximityRatio <= 0.25) {
                            urgency = "moderada";
                        }
                    }
                }

                // Guardar análisis
                metricReport[category][metricName] = {
                    tendencia: trend,
                    pendiente: slope,
                    valorActual: currentValue,
                    rango: { min, max },
                    urgencia: urgency,
                } as MetricAnalysis;

                // --- Muestreo uniforme para reducir datos del gráfico (Downsampling) ---
                const allSeries: ChartPoint[] = readings
                    .map((r) => ({
                        timestamp: r.timestamp, // Mantener string original o Date
                        value: r?.metrics?.[category]?.[metricName],
                    }))
                    .filter(
                        (p): p is ChartPoint => typeof p.value === "number"
                    );

                const MAX_POINTS = 50;
                let series: ChartPoint[];

                if (allSeries.length <= MAX_POINTS) {
                    series = allSeries;
                } else {
                    const step = allSeries.length / MAX_POINTS;
                    series = [];
                    for (let i = 0; i < MAX_POINTS; i++) {
                        const index = Math.floor(i * step);
                        series.push(allSeries[index]);
                    }
                    // Asegurar que incluimos el último punto (el más reciente)
                    const lastPoint = allSeries[allSeries.length - 1];
                    if (series[series.length - 1] !== lastPoint) {
                        series.push(lastPoint);
                    }
                }

                chartData[category].push({
                    metric: metricName,
                    data: series,
                });
            }
        }

        return {
            sensorId: (config as any).sensorId,
            resumen: metricReport,
            chartData,
        };
    });

    return {
        timestamp: new Date().toISOString(),
        report,
    };
}