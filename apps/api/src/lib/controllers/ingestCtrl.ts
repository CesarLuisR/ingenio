import { RequestHandler } from "express";
import { IMessageBus } from "../sockets/messageBus";
import { IReadingQueue } from "../queue/readingQueue";

export function createIngestCtrl(bus: IMessageBus, queue: IReadingQueue): RequestHandler {
    return (req, res) => {
        try {
            const data = req.body;

            if (!data || typeof data !== "object") 
                return res.status(400).json({ error: "Invalid or missing payload" });

            if (!("sensorId" in data) || !("value" in data)) 
                return res.status(400).json({ error: "Missing required fields" });

            queue.enqueue(data);
            bus.publish("reading", data);

            return res.status(202).json({ ok: true });
        } catch (err) {
            console.error("Error in /ingest controller:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    };
}
