import { EventEmitter } from "events";
import { IReadingQueue } from "./readingQueue";

export default class EventEmitterQueue implements IReadingQueue {
    private queue = new EventEmitter();

    onReading(handler: (data: any) => Promise<void>): void {
        this.queue.on("reading", async (data) => {
            await handler(data); 
        });
    };

    enqueue(data: any): void {
        this.queue.emit("reading", data);
    }
}
