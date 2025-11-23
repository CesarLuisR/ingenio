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
    // Asumimos que el ID viene en la URL: /api/analysis/machine/:id
    const machineId = Number(req.params.id); 

    // 1. Validaciones Básicas
    if (!IA_API) {
        return res.status(500).json({ error: "IA_API no configurada" });
    }

    if (isNaN(machineId)) {
        return res.status(400).json({ error: "ID de máquina inválido" });
    }

    try {
        // 2. Obtener la Máquina y sus Sensores (Relacional - Postgres)
        const machine = await prisma.machine.findUnique({
            where: { id: machineId },
            include: {
                sensors: {
                    where: { active: true } // Solo analizamos sensores activos
                }
            }
        });

        if (!machine) {
            return res.status(404).json({ error: "Máquina no encontrada" });
        }

        if (machine.sensors.length === 0) {
            return res.status(400).json({ error: "La máquina no tiene sensores activos asignados" });
        }

        console.log(`🏭 Analizando Máquina: ${machine.name} (${machine.sensors.length} sensores)`);

        // 3. Recolectar Configuración y Lecturas de cada Sensor (Paralelo)
        const sensorDataPromises = machine.sensors.map(async (sensor) => {
            try {
                // A. Obtener Configuración (Cache -> DB)
                // Usamos sensor.sensorId (el string UUID) que es lo que usa el repositorio
                const config = await sensorRepository.getSensorConfig(sensor.sensorId);

                if (!config) {
                    console.warn(`⚠️ Configuración no encontrada para sensor ${sensor.sensorId}`);
                    return null;
                }

                // B. Obtener Lecturas (Mongo)
                // Limitamos a las últimas X lecturas para no saturar la IA (ej: últimas 24h o últimos 1000 puntos)
                const readings = await Reading.find({ sensorId: sensor.sensorId })
                    .sort({ timestamp: -1 }) // Los más recientes primero
                    .limit(500)              // Límite de seguridad
                    .lean<ReadingData[]>();

                if (!readings || readings.length === 0) {
                    return null;
                }

                // Reordenamos cronológicamente para el análisis (antiguo -> nuevo)
                readings.reverse();

                return {
                    config,
                    readings
                } as IMachineData;

            } catch (err) {
                console.error(`❌ Error recolectando datos del sensor ${sensor.sensorId}:`, err);
                return null;
            }
        });

        // Esperamos a que todos los sensores traigan sus datos
        const results = await Promise.all(sensorDataPromises);
        
        // Limpiamos los nulos (sensores sin datos o errores)
        const validSensorData = results.filter((r): r is IMachineData => r !== null);

        if (validSensorData.length === 0) {
            return res.status(400).json({ error: "No hay datos de lectura disponibles para esta máquina" });
        }

        // 4. Preparar Payload para la IA
        // Nota: Dependiendo de tu IA, podrías querer enviar metadata de la máquina también.
        // Por ahora mantenemos la estructura de lista de sensores, pero agrupada lógicamente.
        
        const payload = {
            machineId: machine.id,
            machineName: machine.name,
            machineType: machine.type,
            sensors: validSensorData
        };

        // 5. Enviar al Microservicio de IA
        // NOTA: Si tu IA espera un array directo, envía 'validSensorData'.
        // Si actualizaste la IA para recibir contexto de máquina, envía 'payload'.
        // Aquí asumo que tu endpoint '/analyze' actual espera un array de sensores (IMachineData[]).
        
        console.log(`🚀 Enviando ${validSensorData.length} streams de datos a IA...`);

        const { data: analysisResult } = await axios.post<AnalysisResponse>(
            `${IA_API}/analyze`,
            validSensorData, // <--- Enviamos el array de sensores de ESTA máquina
            { headers: { "Content-Type": "application/json" } }
        );

        // 6. (Opcional) Guardar resultado en caché o DB para no re-calcular inmediatamente
        // await saveAnalysisResult(machineId, analysisResult);

        return res.status(200).json({
            machine: {
                id: machine.id,
                name: machine.name,
                code: machine.code
            },
            analysis: analysisResult
        });

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status || 502;
            console.error(`❌ Error IA (${status}):`, error.response?.data);
            return res.status(status).json({ error: "Fallo en el servicio de inteligencia artificial" });
        }

        console.error("❌ Error interno analizando máquina:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};