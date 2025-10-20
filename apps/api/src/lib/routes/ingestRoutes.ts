import { Router } from "express";
import { IMessageBus } from "../sockets/messageBus";
import { IReadingQueue } from "../queue/readingQueue";
import * as ingestCtrl from "../controllers/ingestCtrl";

export default function ingestRoutes(bus: IMessageBus, queue: IReadingQueue) {
    const router = Router();
    router.post("/", ingestCtrl.createIngestCtrl(bus, queue));
    router.post("/sensor", ingestCtrl.addSensorCtrl);
    return router;
}

