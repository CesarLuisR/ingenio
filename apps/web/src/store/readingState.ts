import { create } from "zustand";
import type { Reading } from "../lib/api";

interface ReadingState {
    sensorMap: Map<string, Reading[]>;
    addReading: (reading: Reading) => void;
    getReadings: (sensorId: string) => Reading[];
}

export const useReadingsStore = create<ReadingState>((set, get) => ({
    sensorMap: new Map(),

    addReading: (reading: Reading) => {
        set(state => {
            const newMap = new Map(state.sensorMap);

            const sensorId = reading.sensorId;
            const foundSensor = newMap.get(sensorId);

            if (foundSensor) {
                const updatedList = [...foundSensor];
                if (updatedList.length === 10) updatedList.shift();
                updatedList.push(reading);
                newMap.set(sensorId, updatedList);
            } else {
                newMap.set(sensorId, [reading]);
            }

            return { sensorMap: newMap };
        });
    },

    getReadings: (sensorId: string) => {
        return get().sensorMap.get(sensorId) || [];
    },
}));