import redis from "../../database/redis.db";
import prisma from "../../database/postgres.db";
import { ConfigData } from "../../types/sensorTypes";

const getCacheKey = (sensorId: string): string => `sensor:${sensorId}:config`;

export async function getSensorConfig(sensorId: string) {
    const cacheKey = getCacheKey(sensorId);

    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const sensor = await prisma.sensor.findFirst({ where: { sensorId } });
    if (!sensor) return null;

    await redis.set(cacheKey, JSON.stringify(sensor));
    return sensor;
}

export async function setSensorConfig(sensorConfig: ConfigData) {
    const sensor = await prisma.sensor.upsert({
        where: { sensorId: sensorConfig.sensorId },
        update: {
            type: sensorConfig.type,
            metricsConfig: sensorConfig.metricsConfig,
            updatedAt: sensorConfig.lastSeen,
        },
        create: {
            sensorId: sensorConfig.sensorId,
            name: sensorConfig.sensorId,
            type: sensorConfig.type,
            metricsConfig: sensorConfig.metricsConfig,
            createdAt: sensorConfig.createdAt,
            updatedAt: sensorConfig.lastSeen,
        },
    });

    const cacheKey = getCacheKey(sensorConfig.sensorId);
    await redis.set(cacheKey, JSON.stringify(sensorConfig));

    return sensor;
}