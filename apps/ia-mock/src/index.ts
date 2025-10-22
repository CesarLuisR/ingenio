import express from "express";
import cors from "cors";
import { IMachineData } from "./types";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/analyze", (req, res) => {
    const data: IMachineData[] = req.body;

    try {
        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ error: "No se recibieron datos válidos" });
        }

        const report = data.map(machine => {
            const { config, readings } = machine;
            const { metricsConfig } = config;

            const metricReport: Record<string, any> = {};

            // Recorremos cada grupo de métricas (electrical, mechanical, etc.)
            for (const category of Object.keys(metricsConfig)) {
                metricReport[category] = {};

                for (const metricName of Object.keys(metricsConfig[category])) {
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
                            message: "No hay suficientes datos para análisis"
                        };
                        continue;
                    }

                    // --- resto del cálculo igual ---
                    const n = points.length;
                    const meanX = points.reduce((a, p) => a + p.x, 0) / n;
                    const meanY = points.reduce((a, p) => a + p.y, 0) / n;
                    const numerator = points.reduce((s, p) => s + (p.x - meanX) * (p.y - meanY), 0);
                    const denominator = points.reduce((s, p) => s + (p.x - meanX) ** 2, 0);
                    const slope = numerator / denominator;
                    const intercept = meanY - slope * meanX;

                    const currentValue = points[n - 1].y;
                    const { min, max } = metricsConfig[category][metricName];

                    let trend: string;
                    if (Math.abs(slope) < 1e-6) trend = "estable";
                    else if (slope > 0) trend = "subiendo";
                    else trend = "bajando";

                    let urgency = "normal";
                    if (typeof min === "number" && typeof max === "number") {
                        const proximity = (currentValue - min) / (max - min);
                        if (proximity >= 1) urgency = "🚨 fuera de rango";
                        else if (proximity >= 0.9) urgency = "⚠️ muy alta";
                        else if (proximity >= 0.75) urgency = "moderada";
                    }

                    metricReport[category][metricName] = {
                        tendencia: trend,
                        pendiente: slope,
                        valorActual: currentValue,
                        rango: { min, max },
                        urgencia: urgency
                    };
                }
            }

            return {
                sensorId: config.sensorId,
                resumen: metricReport
            };
        });

        res.status(200).json({
            timestamp: new Date().toISOString(),
            report,
        });
    } catch (e) {
        console.error("Error recibiendo los datos", e);
        res.status(500).json({ error: "Error procesando los datos" });
    }
});

app.listen(8081, () => console.log(`IA mock listening on port 8081`))