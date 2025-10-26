import axios from "axios";
import { RequestHandler } from "express";
import { Reading } from "../../database/mongo.db";
import { ConfigData, IMachineData, ReadingData } from "../../types/sensorTypes";
import { AnalysisResponse, MetricAnalysis } from "../../types/analysisTypes";

import SensorRepository from "../repositories/sensorRepository";
import RedisRepository from "../repositories/cache/redisRepository";
import PostgresRepository from "../repositories/database/postgresRepository";

const redisRepository = new RedisRepository();
const postgresRepository = new PostgresRepository();
const sensorRepository = new SensorRepository(redisRepository, postgresRepository);

export const getAnalysis: RequestHandler = async (req, res) => {
    const IA_API = process.env.IA_API;
    const data: string[] = req.body; // lista de sensorIds
    const request: IMachineData[] = [];

    if (!IA_API)
        return res.status(500).json({ error: "IA_API no configurada en el entorno" });

    try {
        // --- Construir payload con sensores y lecturas ---
        for (const sensorId of data) {
            const sensorConfig: ConfigData = await sensorRepository.getSensorConfig(sensorId);
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

        // --- Llamada al microservicio de IA ---
        const response = await axios.post<AnalysisResponse>(`${IA_API}/analyze`, request, {
            headers: { "Content-Type": "application/json" },
        });

        const report = response.data; // 👈 obtenemos solo los datos JSON planos

        // --- Mostrar resumen en consola para debugging ---
        console.log("\n==============================");
        console.log("📊 REPORTE DE ANÁLISIS DE SENSORES");
        console.log("==============================");

        for (const sensor of report.report) {
            console.log(`\n🔹 Sensor: ${sensor.sensorId}`);
            for (const [category, metrics] of Object.entries(sensor.resumen)) {
                console.log(`  ▸ ${category.toUpperCase()}`);
                for (const [metric, info] of Object.entries(metrics as Record<string, MetricAnalysis>)) {
                    console.log(
                        `     - ${metric}: ${info.tendencia ?? "?"} | Valor: ${info.valorActual?.toFixed?.(2) ?? "?"} | Pendiente: ${info.pendiente?.toExponential?.(3) ?? "-"} | Urgencia: ${info.urgencia ?? "?"}`
                    );
                }
            }
        }

        console.log("==============================\n");

        // --- Devolver datos al frontend (formato JSON correcto) ---
        return res.status(200).json({
            timestamp: report.timestamp,
            report: report.report.map(sensor => ({
                sensorId: sensor.sensorId,
                resumen: sensor.resumen,
                chartData: sensor.chartData, // 👈 incluye también las gráficas
            })),
        });
    } catch (e: any) {
        console.error("❌ Error durante el análisis:", e.message || e);
        return res.status(500).json({ error: "Error procesando el análisis" });
    }
};
