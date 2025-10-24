import { DBRepository } from ".";
import prisma from "../../../database/postgres.db";
import { ConfigData } from "../../../types/sensorTypes";

// version inicial
class PostgresRepository implements DBRepository {
    async findSensorById(sensorId: string): Promise<any | null> {
        const sensor = await prisma.sensor.findFirst({ where: { sensorId } });
        return sensor;
    }

    async upsertSensorConfig(sensorConfig: ConfigData): Promise<any> {
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
        return sensor;
    }
}

export default PostgresRepository;