import { ConfigData, ConfigDataJson } from "../../types/sensorTypes";

export function toConfigJson(c: ConfigData): ConfigDataJson {
    return {
        ...c,
        createdAt: c.createdAt.toISOString(),
        lastSeen: c.lastSeen.toISOString(),
    };
}
