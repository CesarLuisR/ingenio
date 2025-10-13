import { EventEmitter } from "events";
import { Reading } from "../../database/mongo.db";

const queue = new EventEmitter();

queue.on("reading", async (data) => {
    try {
        await new Reading(data).save();
    } catch (err) {
        console.error("Error guardando lectura:", err);
    }
});

export function enqueueReading(data: any) {
    queue.emit("reading", data);
}
