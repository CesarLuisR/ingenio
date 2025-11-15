import { ConfigData, ConfigDataJson } from "../../types/sensorTypes";

function toISOStringSafe(value: any): string | null {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString();
}

export function toConfigJson(c: ConfigData): ConfigDataJson {
    return {
        ...c,
        createdAt: toISOStringSafe(c.createdAt)!,
        lastSeen: toISOStringSafe(c.lastSeen)!,
    };
}

