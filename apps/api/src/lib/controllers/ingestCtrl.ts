import { RequestHandler } from "express";
import { enqueueReading } from "../queue/readingQueue";
import { broadcast } from "../sockets/webSocket";

export const ingestCtrl: RequestHandler = (req, res) => {
    const data = req.body;

    if (!data || typeof data !== "object") {
        return res.status(400).json({ error: "Invalid or missing payload" });
    }

    try {
        enqueueReading(data);

        if (req.wss) {
            broadcast({ type: "reading", ...data }, req.wss);
        } else {
            console.warn("Broadcast skipped: WebSocket server not available");
        }

        return res.status(202).json({ ok: true });
    } catch (err) {
        console.error("Error processing /ingest:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
