import { EventEmitter } from "events";
import { Reading } from "../../database/mongo.db";
import { IReadingQueue } from "./readingQueue";
import { ReadingData } from "../../types/sensorTypes";

export default class EventEmitterQueue implements IReadingQueue {
    private queue = new EventEmitter();

    constructor() {
        this.queue.on("reading", async (data: ReadingData) => {
            try {
                const reading = new Reading(data);
                await reading.save();
            } catch (err) {
                console.error("Error guardando lectura:", err);
            }
        })
    }

    enqueue(data: ReadingData): void {
        this.queue.emit("reading", data);
    }
}
