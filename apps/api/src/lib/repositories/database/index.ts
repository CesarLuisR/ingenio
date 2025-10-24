import { ConfigData } from "../../../types/sensorTypes";

// version inicial para que funcione
export interface DBRepository {
    findSensorById(sensorId: string): Promise<any | null>;
    upsertSensorConfig(sensorConfig: ConfigData): Promise<any>;
}