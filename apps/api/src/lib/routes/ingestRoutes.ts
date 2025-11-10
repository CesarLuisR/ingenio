import { Router } from "express";
import { IMessageBus } from "../sockets/messageBus";
import * as ingestCtrl from "../controllers/ingestCtrl";

export default function ingestRoutes(bus: IMessageBus) {
    const router = Router();

    router.post("/", ingestCtrl.createIngestCtrl(bus));
    router.post("/sensor", ingestCtrl.addSensorCtrl);
    return router;
}

