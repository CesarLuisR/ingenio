import { RequestHandler } from "express";
import { IMessageBus } from "../sockets/messageBus";
import { IQueue } from "../queue/IQueue";
import { ConfigData, ReadingData } from "../../types/sensorTypes";
import SensorRepository from "../repositories/sensorRepository";
import RedisRepository from "../repositories/cache/redisRepository";
import PostgresRepository from "../repositories/database/postgresRepository";
import Queue from "../queue/queueConcration";
import { Reading } from "../../database/mongo.db";
import { createFormattedInfoInfo } from "../services/infoFormatterService";

const cacheRepository = new RedisRepository();
const sensorRepository = new SensorRepository(cacheRepository, new PostgresRepository());

export function createIngestCtrl(bus: IMessageBus): RequestHandler {
    const queue: IQueue<ReadingData> = new Queue<ReadingData>(100);

    queue.setHandler(async (data: ReadingData) => {
        const reading = new Reading(data);
        await reading.save();

        const readingSensorConfig: ConfigData | null = await sensorRepository.getSensorConfig(data.sensorId);
        if (!readingSensorConfig) {
            console.warn(`⚠️ No sensor config found for sensorId: ${data.sensorId}`);
            return;
        }

        const info = await createFormattedInfoInfo(data, readingSensorConfig);
        bus.publish("reading", info);
    });

    return async (req, res) => {
        try {
            const data: ReadingData = req.body;

            if (!data || typeof data !== "object")
                return res.status(400).json({ error: "Invalid or missing payload" });

            if (!data.metrics || !data.sensorId || !data.timestamp)
                return res.status(400).json({ error: "Missing required fields" });

            const newConfig = await cacheRepository.get(`sensor:${data.sensorId}-updated`);
            if (newConfig) {
                const parsed = JSON.parse(newConfig || "null");

                // Limpiamos las keys relacionadas
                await cacheRepository.delete(`sensor:${data.sensorId}-updated`);
                await cacheRepository.delete(sensorRepository.getCacheKey(data.sensorId));

                return res.status(202).json({ ok: true, config: parsed });
            }

            queue.add(data);

            return res.status(202).json({ ok: true });
        } catch (err) {
            console.error("Error in /ingest controller:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    };
}

export const addSensorCtrl: RequestHandler = async (req, res) => {
    const data: ConfigData = req.body;
    console.log("Received sensor config:", data);

    try {
        let sensor = await sensorRepository.getSensorConfig(data.sensorId);
        if (sensor) {
            console.log(`✅ Config encontrada para ${sensor.sensorId}`);
            return res.status(201).json({ ok: true, sensor });
        }

        sensor = await sensorRepository.setSensorConfig(data);
        console.log(`✅ Config registrada para ${sensor.sensorId}`);
        return res.status(201).json({ ok: true, sensor });
    } catch (err) {
        console.error("❌ Hubo un error creando la config", err);
        return res.status(500).json({ error: "Error al registrar el sensor" });
    }
};
