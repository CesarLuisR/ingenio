import express from "express";
import cors from "cors";
import { ConfigData, IMachineData } from "./types/input";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/analyze", (req, res) => {
    const data: IMachineData[] = req.body;

    try {
        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ error: "No se recibieron datos válidos" });
        }

        const report: SensorReport[] = data.map((machine) => {
            const { config, readings } = machine;
            const { metricsConfig } = config as ConfigData;

            const metricReport: Record<string, any> = {};
            const chartData: ChartData = {};

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

                    // --- Cálculo de regresión lineal estable ---
                    const n = points.length;
                    const x0 = points[0].x;

                    // Normalizar tiempo en horas desde el inicio
                    const normalized = points.map((p) => ({
                        x: (p.x - x0) / (1000 * 60 * 60),
                        y: p.y,
                    }));

                    const meanX =
                        normalized.reduce((a, p) => a + p.x, 0) / n;
                    const meanY =
                        normalized.reduce((a, p) => a + p.y, 0) / n;

                    const numerator = normalized.reduce(
                        (s, p) => s + (p.x - meanX) * (p.y - meanY),
                        0
                    );
                    const denominator = normalized.reduce(
                        (s, p) => s + (p.x - meanX) ** 2,
                        0
                    );

                    const slope =
                        denominator !== 0 ? numerator / denominator : 0; // cambio por hora
                    const intercept = meanY - slope * meanX;

                    const currentValue = points[n - 1].y;
                    const { min, max } =
                        metricsConfig[category][metricName];

                    // --- Determinar tendencia ---
                    const threshold = Math.abs(meanY) * 0.005; // 0.5% del valor medio por hora
                    let trend: "subiendo" | "bajando" | "estable";
                    if (Math.abs(slope) < threshold) trend = "estable";
                    else if (slope > 0) trend = "subiendo";
                    else trend = "bajando";

                    // --- Evaluar urgencia (detecta AMBOS límites) ---
                    let urgency: MetricAnalysis["urgencia"] = "normal";
                    if (typeof min === "number" && typeof max === "number") {
                        if (currentValue > max || currentValue < min) {
                            urgency = "🚨 fuera de rango";
                        } else {
                            const range = max - min;
                            const distanceToMax = max - currentValue;
                            const distanceToMin = currentValue - min;
                            const minDistance = Math.min(
                                distanceToMax,
                                distanceToMin
                            );
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
                    };

                    // --- Muestreo uniforme para reducir datos del gráfico ---
                    const allSeries: ChartPoint[] = readings
                        .map((r) => ({
                            timestamp: r.timestamp,
                            value: r?.metrics?.[category]?.[metricName],
                        }))
                        .filter(
                            (p): p is ChartPoint =>
                                typeof p.value === "number"
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
                        // Asegurar que incluimos el último punto
                        if (
                            series[series.length - 1] !==
                            allSeries[allSeries.length - 1]
                        ) {
                            series.push(allSeries[allSeries.length - 1]);
                        }
                    }

                    chartData[category].push({
                        metric: metricName,
                        data: series,
                    });
                }
            }

            return {
                sensorId: config.sensorId,
                resumen: metricReport,
                chartData,
            };
        });

        const response = {
            timestamp: new Date().toISOString(),
            report,
        };

        return res.status(200).json(response);
    } catch (e) {
        console.error("Error procesando los datos:", e);
        res.status(500).json({ error: "Error procesando el análisis" });
    }
});

app.listen(8081, () =>
    console.log(`✅ IA mock listening on port 8081`)
);
