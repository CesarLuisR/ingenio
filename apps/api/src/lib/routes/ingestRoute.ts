import { Router } from "express";
import { createIngestCtrl } from "../controllers/ingestCtrl";
import { IMessageBus } from "../sockets/messageBus";
import { IReadingQueue } from "../queue/readingQueue";

export default function ingestRoutes(bus: IMessageBus, queue: IReadingQueue) {
    const router = Router();
    router.post("/", createIngestCtrl(bus, queue));
    return router;
}

