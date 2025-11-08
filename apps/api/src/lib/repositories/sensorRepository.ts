import { ConfigData } from "../../types/sensorTypes";
import { CacheRepository } from "./cache";
import { DBRepository } from "./database";

export default class SensorRepository {
    constructor(private cacheRepository: CacheRepository, private dbRepository: DBRepository) {}

    getCacheKey(sensorId: string): string {
        return `sensor:${sensorId}:config`;
    }

    async getSensorConfig(sensorId: string) {
        const cacheKey = this.getCacheKey(sensorId);

        const cached = await this.cacheRepository.get(cacheKey);
        if (cached) return JSON.parse(cached);          

        const sensor = await this.dbRepository.findSensorById(sensorId);
        if (!sensor) return null;

        await this.cacheRepository.set(cacheKey, JSON.stringify(sensor.config));
        return sensor;
    }

    async setSensorConfig(sensorConfig: ConfigData) {
        const sensor = await this.dbRepository.upsertSensorConfig(sensorConfig);
        const cacheKey = this.getCacheKey(sensorConfig.sensorId);
        await this.cacheRepository.set(cacheKey, JSON.stringify(sensorConfig));
        return sensor;
    }
}
