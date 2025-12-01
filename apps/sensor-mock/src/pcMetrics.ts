import si from "systeminformation";
import { ConfigData, ReadingData } from "./types";

export async function createPcReading(config: ConfigData): Promise<ReadingData> {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const temp = await si.cpuTemperature();
    const disk = await si.fsSize();

    const reading: ReadingData = {
        sensorId: config.sensorId,
        timestamp: new Date().toISOString(),
        metrics: {
            system: {
                cpuLoad: parseFloat(cpu.currentLoad.toFixed(2)),
                freeRamMB: Math.round(mem.available / 1024 / 1024),
                usedRamMB: Math.round(mem.active / 1024 / 1024),
                diskUsedGB: parseFloat((disk[0]?.used / 1024 / 1024 / 1024).toFixed(2)),
                diskTotalGB: parseFloat((disk[0]?.size / 1024 / 1024 / 1024).toFixed(2))
            }
        }
    };

    return reading;
}
