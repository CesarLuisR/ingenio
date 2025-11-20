import { DBRepository } from ".";
import prisma from "../../../database/postgres.db";
import { ConfigData } from "../../../types/sensorTypes";
import { Sensor } from "@prisma/client";
import { toConfigJson } from "../../utils/toConfigJson";

class PostgresRepository implements DBRepository {

    /* -------------------------------------------------------------
       FIND SENSOR BY SENSOR-ID (string)
    -------------------------------------------------------------- */
    async findSensorById(sensorId: string): Promise<Sensor | null> {
        return prisma.sensor.findUnique({
            where: { sensorId },
            include: {
                machine: true,     // ahora sensor pertenece a machine
            },
        });
    }

    /* -------------------------------------------------------------
       UPSERT SENSOR CONFIG (primario para IoT ingestion)
       - Si el sensor existe → actualiza
       - Si no existe → crea sensor dentro de una MACHINE
    -------------------------------------------------------------- */
    async upsertSensorConfig(sensorConfig: ConfigData): Promise<Sensor> {

        if (!sensorConfig.machineId) {
            throw new Error("machineId is required to register a sensor.");
        }

		// todelete
		console.log("CONFIG QUE LLEGA: ", sensorConfig);

        return prisma.sensor.upsert({
            where: { sensorId: sensorConfig.sensorId },
            update: {
                name: sensorConfig.name || sensorConfig.sensorId,
                type: sensorConfig.type,
                location: sensorConfig.location,
                config: toConfigJson(sensorConfig),
                lastSeen: sensorConfig.lastSeen
                    ? new Date(sensorConfig.lastSeen)
                    : undefined,
                active: true,
                machineId: sensorConfig.machineId,  // mantiene relación correcta
            },
            create: {
                sensorId: sensorConfig.sensorId,
                name: sensorConfig.name || sensorConfig.sensorId,
                type: sensorConfig.type,
                location: sensorConfig.location,
                config: toConfigJson(sensorConfig),
                lastSeen: sensorConfig.lastSeen
                    ? new Date(sensorConfig.lastSeen)
                    : undefined,
                createdAt: sensorConfig.createdAt
                    ? new Date(sensorConfig.createdAt)
                    : new Date(),
                machineId: sensorConfig.machineId,  // obligatorio ahora
				ingenioId: sensorConfig.ingenioId
            },
        });
    }

    /* -------------------------------------------------------------
       UPDATE SENSOR CONFIG (solo parámetros dinámicos)
    -------------------------------------------------------------- */
    async updateSensorConfig(sensorId: string, config: ConfigData): Promise<Sensor> {
        return prisma.sensor.update({
            where: { sensorId },
            data: {
                config: toConfigJson(config),
                lastSeen: config.lastSeen ? new Date(config.lastSeen) : undefined,
                machineId: config.machineId ?? undefined, // si se desea mover de máquina
            },
        });
    }
}

export default PostgresRepository;
