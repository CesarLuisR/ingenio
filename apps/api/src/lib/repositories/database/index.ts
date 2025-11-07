import { ConfigData } from "../../../types/sensorTypes";
import { Sensor } from "@prisma/client";

export interface DBRepository {
	findSensorById(sensorId: string): Promise<Sensor | null>;
	upsertSensorConfig(sensorConfig: ConfigData): Promise<Sensor>;
	updateSensorConfig(sensorId: string, config: ConfigData): Promise<Sensor>;
}
