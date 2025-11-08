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

            // Si no hay valor previo, empezamos en el punto medio
            const last =
                lastValues[metricGroupName]?.[metricName] ?? mid;

            // Calculamos un cambio relativo de ±10%
            const changeFactor = 1 + (Math.random() * 0.2 - 0.1); // entre 0.9 y 1.1
            let newValue = last * changeFactor;

            // Si se sale del rango (±1%), lo limitamos
            const minBound = min - (min * 0.01);
            const maxBound = max + (max * 0.01);
            if (newValue < minBound) newValue = minBound;
            if (newValue > maxBound) newValue = maxBound;

            // Redondeamos a 2 decimales
            newValue = parseFloat(newValue.toFixed(2));

            // Guardamos para la siguiente iteración
            if (!lastValues[metricGroupName]) lastValues[metricGroupName] = {};
            lastValues[metricGroupName][metricName] = newValue;

            reading.metrics[metricGroupName][metricName] = newValue;
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