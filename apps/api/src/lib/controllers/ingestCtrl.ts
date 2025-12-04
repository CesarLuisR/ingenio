import { RequestHandler } from "express";
import { IMessageBus } from "../sockets/messageBus";
import { ConfigData, DBSensor, ReadingData } from "../../types/sensorTypes";
import SensorRepository from "../repositories/sensorRepository";
import RedisRepository from "../repositories/cache/redisRepository";
import PostgresRepository from "../repositories/database/postgresRepository";
import { Reading } from "../../database/mongo.db";
import { createFormattedInfo } from "../services/infoFormatterService";
import prisma from "../../database/postgres.db";

// todo: este codigo es una mierda o no??? tendria que analizar trade-offs
const cacheRepository = new RedisRepository();
const sensorRepository = new SensorRepository(
    cacheRepository,
    new PostgresRepository()
);

export function createIngestCtrl(bus: IMessageBus): RequestHandler {
    return async (req, res) => {
        try {
            const data: ReadingData = req.body;

            if (!data || typeof data !== "object")
                return res.status(400).json({ error: "Invalid or missing payload" });

            if (!data.metrics || !data.sensorId || !data.timestamp)
                return res.status(400).json({ error: "Missing required fields" });

            const readingSensorConfig: ConfigData | null =
                await sensorRepository.getSensorConfig(data.sensorId);

            const reading = new Reading(data);
            await reading.save();

            if (!readingSensorConfig) {
                console.warn(`⚠️ No sensor config found for sensorId: ${data.sensorId}`);
                return res.status(404).json({ ok: false });
            }

            if (readingSensorConfig.type === "NOCONFIGURADO") {
                const metricsConfig: Record<string, any> = {};

                // crea una config inicial a partir de una reading
                for (const [category, readings] of Object.entries(data.metrics)) {
                    metricsConfig[category] = {};
                    for (const [metricName, value] of Object.entries(readings)) {
                        metricsConfig[category][metricName] = { max: 0, min: 0 }
                    }
                }

                // establecemos la config con estos valores iniciales en los campos de las readings
                // cambiamos tipo a "NOTDEFINED" para que cada vez que llegue una read no se cambien ya que no entra en el if
                const newSensor = await prisma.sensor.update({
                    where: {
                        sensorId: readingSensorConfig.sensorId,
                    },
                    data: {
                        config: metricsConfig,
                        type: "NOTDEFINED"
                    }
                });

                await sensorRepository.setSensorConfig({
                    sensorId: newSensor.sensorId,
                    name: newSensor.sensorId,
                    machineId: newSensor.machineId,
                    ingenioId: newSensor.ingenioId,
                    type: "NOTDEFINED",
                    intervalMs: 1000,
                    metricsConfig: metricsConfig, 
                    configVersion: "v1",
                    active: true
                });

                // borramos la cache para que la actualice
                // todo: por alguna razon no esta funcionando esto pero funciona igual xd
                await cacheRepository.delete(sensorRepository.getCacheKey(data.sensorId));
            }

            const info = await createFormattedInfo(data, readingSensorConfig);
            if (readingSensorConfig?.active === true)
                bus.publishToIngenio("reading", info, readingSensorConfig.ingenioId);

            const newConfig = await cacheRepository.get(`sensor:${data.sensorId}-updated`);
            if (newConfig) {
                const parsed = JSON.parse(newConfig || "null");

                await cacheRepository.delete(`sensor:${data.sensorId}-updated`);
                await cacheRepository.delete(sensorRepository.getCacheKey(data.sensorId));

                return res.status(202).json({ ok: true, config: parsed });
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
    console.log("Received sensor config:", data);

    try {
        let sensor: DBSensor = await sensorRepository.getSensorConfig(data.sensorId);

        if (sensor) {
            console.log(`✅ Config encontrada para ${sensor.sensorId}`);

            if (sensor.name === "NOCONFIGURADO") {
                const newSensor = await prisma.sensor.update({
                    where: {
                        sensorId: sensor.sensorId,
                    },
                    data: {
                        name: sensor.sensorId,
                    }
                });

                await sensorRepository.setSensorConfig({
                    sensorId: newSensor.sensorId,
                    name: newSensor.sensorId,
                    machineId: newSensor.machineId,
                    ingenioId: newSensor.ingenioId,
                    type: "NOCONFIGURADO",
                    intervalMs: 1000,
                    metricsConfig: {},
                    configVersion: "v1",
                    active: true
                });
            }

            return res.status(201).json({ ok: true, sensor });
        }

        // Sensor perdido porque no se creo en la UI
        if (!data.metricsConfig) {
            console.log("SENSOR PERDIDO", data.sensorId);
            return res.status(500).json({ ok: false, sensor });
        }

        sensor = await sensorRepository.setSensorConfig(data);
        console.log(`✅ Config registrada para ${sensor.sensorId}`);
        return res.status(201).json({ ok: true, sensor });
    } catch (err) {
        console.error("❌ Hubo un error creando la config", err);
        return res.status(500).json({ error: "Error al registrar el sensor" });
    }
};
