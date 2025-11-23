// ------------------------------
// CONFIG DATA (Sensor Setup)
// ------------------------------
export interface ConfigData {
    sensorId: string;

    machineId: number;
    ingenioId: number;

    name?: string | null;
    type: string;
    location?: string | null;

    intervalMs: number;

    metricsConfig: Record<
        string,
        Record<string, { min?: number; max?: number }>
    >;

    createdAt?: Date | string;
    lastSeen?: Date | string;

    active?: boolean;
    configVersion: string;
}


// ------------------------------
// VERSION PARA GUARDAR EN BD / JSON
// ------------------------------
export type ConfigDataJson = {
    sensorId: string;
    machineId: number;

    name?: string | null;
    type: string;
    location?: string | null;

    intervalMs: number;

    metricsConfig: Record<
        string,
        Record<string, { min?: number; max?: number }>
    >;

    createdAt?: string;  // normalizado como string
    lastSeen?: string;

    active: boolean;
    configVersion: string;
};


// ------------------------------
// REAL-TIME SENSOR READING
// ------------------------------
export interface ReadingData {
    sensorId: string;
    timestamp: string; // ISO timestamp
    metrics: Record<string, Record<string, number>>;
}


// ------------------------------
// MACHINE DATA: Configuration + Readings
// ------------------------------
export interface IMachineData {
    machineId: number;

    config: ConfigData;
    readings: ReadingData[];
}

export interface IMachineData {
    config: ConfigData;
    readings: ReadingData[];
}