import fs from "fs";
import path from "path";
import { ConfigData, ReadingData } from "./types";
import { createRandomReading, sendReading, sendSensor } from "./logic";

const configFileName = process.env.CONFIG_FILE_NAME || 'none';
const configPath = path.join(__dirname, "../config", configFileName);
const url = process.env.API || "klk";

if (!fs.existsSync(configPath)) {
    console.log(`Config file not found: ${configPath}`);
    process.exit(1);
}

const fileContent = fs.readFileSync(configPath, 'utf-8');
const explicitConfig: ConfigData = JSON.parse(fileContent);

async function run() {
    while (true) {
        const success = await sendSensor(url, explicitConfig);
        if (success) break;
        
        // delay
        await new Promise(_ => setTimeout(_, 1000));
    }

    setInterval(async () => {
        const reading = createRandomReading(explicitConfig);
        await sendReading(url, reading);
    }, explicitConfig.intervalMs);
}

run();
