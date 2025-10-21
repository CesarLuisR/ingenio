export interface ConfigData {
    sensorId: string;
    type: string;
    location: string;
    intervalMs: number;
    metricsConfig: Record<string, Record<string, { min?: number, max?: number }>>;
    createdAt: Date;
    lastSeen: Date;
    active: boolean;
    configVersion: string;
}

export interface ReadingData {
    sensorId: string;
    timestamp: string;
    metrics: Record<string, Record<string, number>>;
}

export interface IMachineData {
    config: ConfigData;
    readings: ReadingData[];
}