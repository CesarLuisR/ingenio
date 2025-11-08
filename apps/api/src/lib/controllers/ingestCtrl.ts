import { RequestHandler } from "express";
import { IMessageBus } from "../sockets/messageBus";
import { IReadingQueue } from "../queue/readingQueue";
import { ConfigData, ReadingData } from "../../types/sensorTypes";
import { createPublishInfo } from "../services/sensorServices";
import SensorRepository from "../repositories/sensorRepository";
import RedisRepository from "../repositories/cache/redisRepository";
import PostgresRepository from "../repositories/database/postgresRepository";

const cacheRepository = new RedisRepository();
const sensorRepository = new SensorRepository(cacheRepository, new PostgresRepository()); 

export function createIngestCtrl(bus: IMessageBus, queue: IReadingQueue): RequestHandler {
    return async (req, res) => {
        try {
            const data: ReadingData = req.body;

            if (!data || typeof data !== "object")
                return res.status(400).json({ error: "Invalid or missing payload" });

            if (!data.metrics || !data.sensorId || !data.timestamp)
                return res.status(400).json({ error: "Missing required fields" });

            queue.enqueue(data);

            const readingSensorConfig: ConfigData | null = await sensorRepository.getSensorConfig(data.sensorId);
            if (!readingSensorConfig) {
                console.warn(`No sensor config found for sensorId: ${data.sensorId}`);
                return res.status(404).json({ error: "Sensor configuration not found" });
            }

            const info = await createPublishInfo(data, readingSensorConfig);
            bus.publish("reading", info);

            const newConfig = await cacheRepository.get(`sensor:${data.sensorId}-updated`);
            if (newConfig) {
                const parsed = JSON.parse(newConfig || "null");
                await cacheRepository.delete(`sensor:${data.sensorId}-updated`);
                await cacheRepository.delete(sensorRepository.getCacheKey(data.sensorId));
                console.log(`✅ Nueva config para ${data.sensorId} enviada al sensor`);
                console.log("Nueva config: ", parsed);
                res.status(202).json({ ok: true, config: parsed });
                return;
            }

            return res.status(202).json({ ok: true });
        } catch (err) {
            console.error("Error in /ingest controller:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    };
}

export const addSensorCtrl: RequestHandler = async (req, res) => {
    const data: ConfigData = req.body;

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
