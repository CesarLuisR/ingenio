import { RequestHandler } from "express";
import axios from "axios";
import { Reading } from "../../database/mongo.db";
import { ConfigData, IMachineData, ReadingData } from "../../types/sensorTypes";
import { getSensorConfig } from "../repositories/sensorRepository";

export const getAnalysis: RequestHandler = async (req, res) => {
    const IA_API = process.env.IA_API;
    const data: string[] = req.body; // lista de sensorIds
    const request: IMachineData[] = [];

    if (!IA_API) {
        return res.status(500).json({ error: "IA_API no configurada en el entorno" });
    }

    try {
        // Construimos el payload
        for (const sensorId of data) {
            const sensorConfig: ConfigData = await getSensorConfig(sensorId);
            if (!sensorConfig) {
                console.warn(`⚠️  Sensor no encontrado: ${sensorId}`);
                continue;
            }

            const readings: ReadingData[] = await Reading.find({ sensorId });
            if (!readings || readings.length === 0) {
                console.warn(`⚠️  No hay lecturas para el sensor: ${sensorId}`);
                continue;
            }

            request.push({ config: sensorConfig, readings });
        }

        if (request.length === 0) {
            return res.status(400).json({ error: "No hay sensores válidos con datos" });
        }

        // Llamada al microservicio de análisis
        const response = await axios.post(`${IA_API}/analyze`, request);
        const report = response.data;

        // Mostrar en consola de forma legible
        console.log("\n==============================");
        console.log("📊 REPORTE DE ANÁLISIS DE SENSORES");
        console.log("==============================");

        for (const sensor of report.report) {
            console.log(`\n🔹 Sensor: ${sensor.sensorId}`);
            for (const [category, metrics] of Object.entries(sensor.resumen)) {
                console.log(`  ▸ ${category.toUpperCase()}`);

                for (const [metric, info] of Object.entries(metrics as Record<string, {
                    tendencia?: string;
                    pendiente?: number;
                    valorActual?: number;
                    rango?: { min?: number; max?: number };
                    urgencia?: string;
                }>)) {
                    console.log(
                        `     - ${metric}: ${info.tendencia ?? "?"} | Valor: ${info.valorActual?.toFixed?.(2) ?? "?"} | Pendiente: ${info.pendiente?.toExponential?.(3) ?? "-"} | Urgencia: ${info.urgencia ?? "?"}`
                    );
                }
            }
        }

        console.log("==============================\n");

        // Responder con el contenido real, no con el objeto de Axios
        return res.status(200).json(report);

    } catch (e: any) {
        console.error("❌ Error durante el análisis:", e.message || e);
        return res.status(500).json({ error: "Error procesando el análisis" });
    }
};
