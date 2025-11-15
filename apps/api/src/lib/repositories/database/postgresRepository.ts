import { DBRepository } from ".";
import prisma from "../../../database/postgres.db";
import { ConfigData } from "../../../types/sensorTypes";
import { Sensor } from "@prisma/client";
import { toConfigJson } from "../../utils/toConfigJson";

class PostgresRepository implements DBRepository {
	async findSensorById(sensorId: string): Promise<Sensor | null> {
		return prisma.sensor.findUnique({
			where: { sensorId },
		});
	}

	async upsertSensorConfig(sensorConfig: ConfigData): Promise<Sensor> {
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
				createdAt: new Date(sensorConfig.createdAt),
				ingenioId: sensorConfig.ingenioId,
			},
		});
	}

	async updateSensorConfig(sensorId: string, config: ConfigData): Promise<Sensor> {
		return prisma.sensor.update({
			where: { sensorId },
			data: {
				config: toConfigJson(config),
				lastSeen: config.lastSeen ? new Date(config.lastSeen) : undefined,
			},
		});
	}
}

export default PostgresRepository;
