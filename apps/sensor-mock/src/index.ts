import fs from "fs";
import path from "path";
import { ConfigData } from "./types";
import { createRandomReading, sendReading, sendSensor } from "./logic";
import { createPcReading } from "./pcMetrics";

const url = process.env.API || "klk";

// --- Carga de configuración de sensores ---
function loadConfig(fileName: string): ConfigData {
    const configPath = path.join(__dirname, "../config", fileName);
    if (!fs.existsSync(configPath)) {
        console.log(`Config not found: ${configPath}`);
        process.exit(1);
    }
    const content = fs.readFileSync(configPath, "utf-8");
    const cfg = JSON.parse(content) as ConfigData;
    return cfg;
}

const industrialConfig = loadConfig(process.env.CONFIG_FILE_NAME || "motor.json");
const pcConfig = loadConfig("pc-sensor.json");

// --- Diccionario para referencia rápida ---
const sensors = [
    { name: "industrial", config: industrialConfig, savePath: path.join(__dirname, "../config", process.env.CONFIG_FILE_NAME || "motor.json") },
    { name: "pc", config: pcConfig, savePath: null } // PC sensor no guarda archivo
];

// --- Loop generador para cada sensor ---
async function runSensorLoop(sensor: { name: string; config: ConfigData; savePath: string | null }) {
    console.log(`Inicializando sensor: ${sensor.name}`);

    while (true) {
        const ok = await sendSensor(url, sensor.config);
        if (ok) break;
        await new Promise(r => setTimeout(r, 1000));
    }

    while (true) {
        let reading;

        if (sensor.name === "industrial") {
            reading = createRandomReading(sensor.config);
        } else if (sensor.name === "pc") {
            reading = await createPcReading(sensor.config);
        }

        const newConfig = await sendReading(
            url,
            reading!,
            sensor.savePath,         // ruta del archivo o null
            sensor.config.intervalMs,
            sensor.config            // <<–––– ESTE era el parámetro faltante
        );

        if (newConfig) {
            Object.assign(sensor.config, newConfig);
            console.log(`[${sensor.name}] Config actualizada`);
        }

        await new Promise(r => setTimeout(r, sensor.config.intervalMs));
    }
}

async function run() {
    for (const s of sensors) {
        runSensorLoop(s);
    }
}

run();
