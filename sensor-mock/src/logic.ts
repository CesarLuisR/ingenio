import { ConfigData, ReadingData } from "./types";

export function createRandomReading(config: ConfigData) {
    const reading: ReadingData = {
        sensorId: config.sensorId || "unknown",
        timestamp: new Date().toISOString(),
        metrics: {}
    };

    for (const [group, vars] of Object.entries(config.metricsConfig)) {
        reading.metrics[group] = {};
        for (const [key, range] of Object.entries(vars)) {
            let min = range.min ?? 0;
            let max = range.max ?? 100;

            // Making it get out of the fine range by a 10% sometimes
            min = min - (min * 0.1);
            max = max + (max * 0.1);

            const value = parseFloat((Math.random() * (max - min) + min).toFixed(2));
            reading.metrics[group][key] = value;
        }
    }

    return reading;
}

export async function sendReading(url: string, reading: ReadingData) {
    console.log("Enviando datos a: ", url);
    console.log(reading);

    try {
        const res = await fetch(`${url}/ingest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reading)
        });
        console.log("Respuesta: ", res.status);
    } catch (e: any) {
        if (e.code === "ECONNREFUSED")
            console.error("Conexion rechazada. Revise el estado del servidor");
        else console.error("Error desconocido", e.message);
    }
}

export async function sendSensor(url: string, sensorConfig: ConfigData): Promise<boolean> {
    console.log("Enviando sensor a: ", url);

    try {
        const res = await fetch(`${url}/ingest/sensor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sensorConfig)
        });
        console.log("Respuesta: ", res.status);
        return true;
    } catch (e: any) {
        if (e.code === "ECONNREFUSED")
            console.error("Conexion rechazada. Revise el estado del servidor");
        else console.error("Error desconocido", e.message);
        return false;
    }
}