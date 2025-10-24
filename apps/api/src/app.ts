import express from "express";
import cors from "cors";
import http from "http";
import ingestRoutes from "./lib/routes/ingestRoutes";
import { WebSocketServer } from "ws";
import { WebSocketBus } from "./lib/sockets/webSocket";
import EventEmitterQueue from "./lib/queue/EventEmitter";

import sensorRoutes from "./lib/routes/sensorRoutes";
import maintenanceRoutes from "./lib/routes/maintenanceRoutes";
import failureRoutes from "./lib/routes/failureRoutes";
import userRoutes from "./lib/routes/userRoutes";
import analyzeRoutes from "./lib/routes/analyzeRoutes";
import { ReadingData } from "./types/sensorTypes";
import { Reading } from "./database/mongo.db";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });
const messageBus = new WebSocketBus(wss);
const queue = new EventEmitterQueue();
queue.onReading(async (data: ReadingData) => {
    const reading = new Reading(data);
    await reading.save();
});

// Sensor info ingestion
app.use("/ingest", ingestRoutes(messageBus, queue));

// REST CRUD
app.use("/sensors", sensorRoutes);
app.use("/maintenances", maintenanceRoutes);
app.use("/failures", failureRoutes);
app.use("/users", userRoutes);
app.use("/analyze", analyzeRoutes);

export default server;
