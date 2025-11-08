import { ConfigData, ReadingData } from "./types";
import fs from "fs/promises";

export function createRandomReading(config: ConfigData) {
    const reading: ReadingData = {
        sensorId: config.sensorId,
        timestamp: new Date().toISOString(),
        metrics: {}
    }

    for (const metricGroup of Object.entries(config.metricsConfig)) {
        const metricGroupName = metricGroup[0]
        const metricGroupValues = metricGroup[1];
        reading.metrics[metricGroupName] = {};

        for (const metric of Object.entries(metricGroupValues)) {
            const metricName = metric[0];
            const metricValue = metric[1];

            const min = metricValue.min - (metricValue.min * 0.01);
            const max = metricValue.max + (metricValue.max * 0.01);

            const randomValue = parseFloat((Math.random() * (max - min) + min).toFixed(2));

            reading.metrics[metricGroupName][metricName] = randomValue;
        }
    }

    return reading;
}

export async function sendReading(url: string, reading: ReadingData, configPath: string, interval: number): Promise<ConfigData | null> {
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

        const data = await res.json();
        if (data.config) {
            console.log("Nueva configuración recibida. Guardando en:", configPath);

            // Guardar con formato bonito y reemplazar el archivo existente
            await fs.writeFile(configPath, JSON.stringify(data.config, null, 2), "utf-8");
            console.log("Configuración actualizada exitosamente.");
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
        return true;
    } catch (e: any) {
        if (e.code === "ECONNREFUSED")
            console.error("Conexion rechazada. Revise el estado del servidor");
        else console.error("Error desconocido", e.message);
        return false;
    }
}