import { EventEmitter } from "events";
import { Reading } from "../../database/mongo.db";
import { IReadingQueue } from "./readingQueue";

export default class EventEmitterQueue implements IReadingQueue {
    private queue = new EventEmitter();

    constructor() {
        this.queue.on("reading", async (data) => {
            try {
                await new Reading(data).save();
            } catch (err) {
                console.error("Error guardando lectura:", err);
            }
        })
    }

    enqueue(data: any): void {
        this.queue.emit("reading", data);
    }
}
