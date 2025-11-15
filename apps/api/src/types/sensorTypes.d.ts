export interface ConfigData {
    sensorId: string;
    ingenioId: number;
    name: string | null;
    type: string;
    location: string;
    intervalMs: number;
    metricsConfig: Record<string, Record<string, { min?: number, max?: number }>>;
    createdAt: Date;
    lastSeen: Date;
    active: boolean;
    configVersion: string;
}

export type ConfigDataJson = {
    sensorId: string;
    ingenioId: number;
    name: string | null;
    type: string;
    location: string;
    intervalMs: number;
    metricsConfig: Record<string, Record<string, { min?: number; max?: number }>>;
    createdAt: string;   // << Date → string
    lastSeen: string;    // << Date → string
    active: boolean;
    configVersion: string;
};

export interface ReadingData {
    sensorId: string;
    timestamp: string;
    metrics: Record<string, Record<string, number>>;
}

export interface IMachineData {
    config: ConfigData;
    readings: ReadingData[];
}