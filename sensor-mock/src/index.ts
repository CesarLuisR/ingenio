import axios from "axios";

interface SensorData {
    sensorId: string;
    value: number;
    unit?: string;
    ts: Date;
    seq: number;
}

const SERVER_HOST = process.env.CENTRAL_SERVER || "http://localhost";
const SERVER_PORT = 5000;
const API_PATH = "/ingest";
const INTERVALO_MS = 3000;

let counter = 1; 

async function enviarMockedData(): Promise<void> {
    const data: SensorData = {
        sensorId: "sensor-" + Math.floor(Math.random() * 5 + 1), // string
        value: parseFloat((Math.random() * (30 - 20) + 20).toFixed(2)),
        unit: "°C",
        ts: new Date(),
        seq: counter++
    };

    const URL = `${SERVER_HOST}:${SERVER_PORT}${API_PATH}`;
    console.log(`\n📡 Enviando data a ${URL}`);
    console.log(data);

    try {
        const res = await axios.post(URL, data);
        console.log(`✅ Respuesta: ${res.status}`);
    } catch (e: any) {
        if (e.code === "ECONNREFUSED") {
            console.error("❌ Conexión rechazada. ¿El servidor está corriendo?");
        } else {
            console.error("❌ Error desconocido:", e.message);
        }
    }
}

console.log("Iniciando sensor mock...");
(async () => {
    await enviarMockedData();
    setInterval(enviarMockedData, INTERVALO_MS);
})();
