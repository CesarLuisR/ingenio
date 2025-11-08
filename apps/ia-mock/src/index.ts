import express from "express";
import cors from "cors";
import { ConfigData, IMachineData } from "./types/input";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/analyze", (req, res) => {
    const data: IMachineData[] = req.body;
    console.log(data);

    try {
        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ error: "No se recibieron datos válidos" });
        }

        const report: SensorReport[] = data.map(machine => {
            const { config, readings } = machine;
            const { metricsConfig } = config as ConfigData;

            console.log("METRICS CONFIG:", metricsConfig);

            const metricReport: Record<string, any> = {};
            const chartData: ChartData = {};

            // Recorremos cada grupo de métricas (electrical, mechanical, etc.)
            for (const category of Object.keys(metricsConfig)) {
                metricReport[category] = {};
                chartData[category] = [];

                for (const metricName of Object.keys(metricsConfig[category])) {
                    // Tomamos todos los puntos válidos
                    const points = readings
                        .map(r => {
                            const value = r?.metrics?.[category]?.[metricName];
                            if (typeof value !== "number" || isNaN(value)) return null;
                            return {
                                x: new Date(r.timestamp).getTime(),
                                y: value,
                            };
                        })
                        .filter((p): p is { x: number; y: number } => p !== null);

                    if (points.length < 2) {
                        metricReport[category][metricName] = {
                            message: "No hay suficientes datos para análisis",
                        };
                        continue;
                    }

                    // --- Cálculo de regresión lineal simple ---
                    const n = points.length;
                    const meanX = points.reduce((a, p) => a + p.x, 0) / n;
                    const meanY = points.reduce((a, p) => a + p.y, 0) / n;
                    const numerator = points.reduce(
                        (s, p) => s + (p.x - meanX) * (p.y - meanY),
                        0
                    );
                    const denominator = points.reduce(
                        (s, p) => s + (p.x - meanX) ** 2,
                        0
                    );
                    const slope = numerator / denominator;
                    const intercept = meanY - slope * meanX;

                    const currentValue = points[n - 1].y;
                    const { min, max } = metricsConfig[category][metricName];

                    // Determinar tendencia
                    let trend: "subiendo" | "bajando" | "estable";
                    if (Math.abs(slope) < 1e-6) trend = "estable";
                    else if (slope > 0) trend = "subiendo";
                    else trend = "bajando";

                    // Evaluar urgencia
                    let urgency: MetricAnalysis["urgencia"] = "normal";
                    if (typeof min === "number" && typeof max === "number") {
                        const proximity = (currentValue - min) / (max - min);
                        if (proximity >= 1) urgency = "🚨 fuera de rango";
                        else if (proximity >= 0.9) urgency = "⚠️ muy alta";
                        else if (proximity >= 0.75) urgency = "moderada";
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
                        .map(r => ({
                            timestamp: r.timestamp,
                            value: r?.metrics?.[category]?.[metricName],
                        }))
                        .filter(p => typeof p.value === "number");

                    const MAX_POINTS = 50;
                    let series: ChartPoint[];

                    if (allSeries.length <= MAX_POINTS) {
                        // Si hay pocos puntos, usamos todos
                        series = allSeries;
                    } else {
                        // Tomamos puntos uniformemente distribuidos
                        const step = allSeries.length / MAX_POINTS;
                        series = [];
                        for (let i = 0; i < MAX_POINTS; i++) {
                            const index = Math.floor(i * step);
                            series.push(allSeries[index]);
                        }
                    }

                    // Guardar datos para graficar
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

        // --- Respuesta final ---
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

app.listen(8081, () => console.log(`IA mock listening on port 8081`));
