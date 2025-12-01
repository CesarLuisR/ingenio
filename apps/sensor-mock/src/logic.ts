import { ConfigData, ReadingData } from "./types";
import fs from "fs/promises";

const lastValues: Record<string, Record<string, number>> = {};

export function createRandomReading(config: ConfigData) {
    const reading: ReadingData = {
        sensorId: config.sensorId,
        timestamp: new Date().toISOString(),
        metrics: {}
    };

    for (const [metricGroupName, metricGroupValues] of Object.entries(config.metricsConfig)) {
        reading.metrics[metricGroupName] = {};

        for (const [metricName, metricValue] of Object.entries(metricGroupValues)) {
            const min = metricValue.min;
            const max = metricValue.max;
            const mid = (min + max) / 2;

            const last =
                lastValues[metricGroupName]?.[metricName] ?? mid;

            const changeFactor = 1 + (Math.random() * 0.2 - 0.1);
            let newValue = last * changeFactor;

            const minBound = min - (min * 0.01);
            const maxBound = max + (max * 0.01);
            if (newValue < minBound) newValue = minBound;
            if (newValue > maxBound) newValue = maxBound;

            newValue = parseFloat(newValue.toFixed(2));

            if (!lastValues[metricGroupName]) lastValues[metricGroupName] = {};
            lastValues[metricGroupName][metricName] = newValue;

            reading.metrics[metricGroupName][metricName] = newValue;
        }
    }

    return reading;
}

export async function sendReading(
    url: string,
    reading: ReadingData,
    configPath: string | null,   // ahora aceptamos null
    interval: number,
    currentConfig: ConfigData    // <<–– recibimos la config aquí
): Promise<ConfigData | null> {

    console.log("Enviando datos a: ", url);
    console.log(reading, interval);

    try {
        const res = await fetch(`${url}/ingest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reading)
        });

        if (res.status === 404) {
            console.log("Pidiendo config al sensor mock");
            await sendSensor(url, currentConfig);
            return null;
        }

        if (res.status !== 200 && res.status !== 202) {
            console.log("Respuesta: ", res.status);
            return null;
        }

        const data = await res.json();
        
        if (data.config) {
            if (configPath) {
                console.log("Nueva configuración recibida. Guardando en:", configPath);

                await fs.writeFile(
                    configPath,
                    JSON.stringify(data.config, null, 2),
                    "utf-8"
                );
                console.log("Configuración actualizada exitosamente.");
            }

            console.log("Respuesta: ", res.status);
            return data.config;
        }

        console.log("Respuesta: ", res.status);
        return null;

    } catch (e: any) {
        if (e.code === "ECONNREFUSED")
            console.error("Conexion rechazada. Revise el estado del servidor");
        else console.error("Error desconocido", e.message);

        return null;
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
        return res.ok;

    } catch (e: any) {
        if (e.code === "ECONNREFUSED")
            console.error("Conexion rechazada. Revise el estado del servidor");
        else console.error("Error desconocido", e.message);

        return false;
    }
}
