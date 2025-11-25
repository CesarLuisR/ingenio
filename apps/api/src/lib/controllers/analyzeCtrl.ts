import axios from "axios";
import { Request, Response } from "express";
import prisma from "../../database/postgres.db"; 
import { Reading } from "../../database/mongo.db";
import { IMachineData, ReadingData } from "../../types/sensorTypes";
import { AnalysisResponse } from "../../types/analysisTypes";

import SensorRepository from "../repositories/sensorRepository";
import RedisRepository from "../repositories/cache/redisRepository";
import PostgresRepository from "../repositories/database/postgresRepository";

// Repositorios
const sensorRepository = new SensorRepository(new RedisRepository(), new PostgresRepository());

export const analyzeMachine = async (req: Request, res: Response) => {
    const { IA_API } = process.env;
    const machineId = Number(req.params.id);

    // 1. Validaciones Básicas
    if (!IA_API) {
        return res.status(500).json({ error: "IA_API no configurada en variables de entorno" });
    }

    if (isNaN(machineId)) {
        return res.status(400).json({ error: "ID de máquina inválido" });
    }

    try {
        // 2. Obtener la Máquina y sus Sensores Activos (Postgres)
        const machine = await prisma.machine.findUnique({
            where: { id: machineId },
            include: {
                sensors: {
                    where: { active: true }
                }
            }
        });

        if (!machine) {
            return res.status(404).json({ error: "Máquina no encontrada" });
        }

        if (machine.sensors.length === 0) {
            return res.status(400).json({ error: "La máquina no tiene sensores activos para analizar" });
        }

        console.log(`🏭 Preparando datos para: ${machine.name} (${machine.sensors.length} sensores)`);

        // 3. Recolectar Configuración y Lecturas (Paralelo)
        const sensorDataPromises = machine.sensors.map(async (sensor) => {
            try {
                // A. Configuración (Redis/DB)
                const config = await sensorRepository.getSensorConfig(sensor.sensorId);
                if (!config) return null;

                // B. Lecturas (Mongo) - Últimos 1000 puntos para tener buena historia
                const readings = await Reading.find({ sensorId: sensor.sensorId })
                    .sort({ timestamp: -1 })
                    .limit(1000) 
                    .lean<ReadingData[]>();

                if (!readings || readings.length < 10) {
                    console.warn(`⚠️ Pocos datos para sensor ${sensor.sensorId}, omitiendo.`);
                    return null;
                }

                // Reordenar cronológicamente para Prophet (Antiguo -> Nuevo)
                readings.reverse();

                return {
                    config,
                    readings
                } as IMachineData;

            } catch (err) {
                console.error(`❌ Error data sensor ${sensor.sensorId}:`, err);
                return null;
            }
        });

        const results = await Promise.all(sensorDataPromises);
        const validSensorData = results.filter((r): r is IMachineData => r !== null);

        if (validSensorData.length === 0) {
            return res.status(400).json({ error: "No hay suficientes datos históricos para realizar predicciones." });
        }

        // 4. Enviar al Cerebro Python 🧠
        console.log(`🚀 Enviando ${validSensorData.length} sensores al servicio de IA...`);

        const { data: analysisResult } = await axios.post<AnalysisResponse>(
            `${IA_API}/analyze`,
            validSensorData,
            { headers: { "Content-Type": "application/json" } }
        );

        console.log(`🚀 Resultado de análisis recibido.`);

        // ============================================================
        // 4.5. GUARDAR RESULTADO EN LA MÁQUINA (POSTGRES)
        // ============================================================
        const now = new Date();
        
        await prisma.machine.update({
            where: { id: machineId },
            data: {
                lastAnalysis: analysisResult as any, // Cast a 'any' o 'Prisma.InputJsonValue' para evitar conflictos de tipos estrictos
                lastAnalyzedAt: now
            }
        });

        console.log(`💾 Análisis guardado exitosamente en Máquina ID: ${machineId}`);

        // 5. Responder al Frontend
        return res.status(200).json({
            machine: {
                id: machine.id,
                name: machine.name,
                code: machine.code,
                // Devolvemos los datos frescos que acabamos de guardar
                lastAnalysis: analysisResult,
                lastAnalyzedAt: now
            },
            analysis: analysisResult // Mantenemos esto por si el frontend lo espera separado
        });

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status || 502;
            console.error(`❌ Error del Servicio IA (${status}):`, error.response?.data || error.message);
            return res.status(status).json({ 
                error: "El servicio de IA no pudo procesar la solicitud.",
                details: error.response?.data 
            });
        }

        console.error("❌ Error interno analizando máquina:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};