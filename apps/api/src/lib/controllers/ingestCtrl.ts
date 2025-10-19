import { RequestHandler } from "express";
import { IMessageBus } from "../sockets/messageBus";
import { IReadingQueue } from "../queue/readingQueue";
import { ConfigData, ReadingData } from "../../types/sensorTypes";
import { getSensorConfig, setSensorConfig } from "../repositories/sensorRepository";
import { createPublishInfo } from "../services/sensorServices";

export function createIngestCtrl(bus: IMessageBus, queue: IReadingQueue): RequestHandler {
    return async (req, res) => {
        try {
            const data: ReadingData = req.body;

            if (!data || typeof data !== "object")
                return res.status(400).json({ error: "Invalid or missing payload" });

            if (!data.metrics || !data.sensorId || !data.timestamp)
                return res.status(400).json({ error: "Missing required fields" });

            queue.enqueue(data);

            const info = await createPublishInfo(data);
            bus.publish("reading", info);

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
        let sensor = await getSensorConfig(data.sensorId);
        if (sensor) {
            console.log(`✅ Config encontrada para ${sensor.sensorId}`);
            return res.status(201).json({ ok: true, sensor });
        }

        sensor = await setSensorConfig(data);
        console.log(`✅ Config registrada para ${sensor.sensorId}`);
        return res.status(201).json({ ok: true, sensor });
    } catch (err) {
        console.error("❌ Hubo un error creando la config", err);
        return res.status(500).json({ error: "Error al registrar el sensor" });
    }
};
