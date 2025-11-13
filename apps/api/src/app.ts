import express from "express";
import cors from "cors";
import http from "http";
import ingestRoutes from "./lib/routes/ingestRoutes";
import { WebSocketServer } from "ws";
import { WebSocketBus } from "./lib/sockets/webSocket";

import sensorRoutes from "./lib/routes/sensorRoutes";
import maintenanceRoutes from "./lib/routes/maintenanceRoutes";
import failureRoutes from "./lib/routes/failureRoutes";
import userRoutes from "./lib/routes/userRoutes";
import analyzeRoutes from "./lib/routes/analyzeRoutes";
import technicianRoutes from "./lib/routes/technicianRoutes";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });
const messageBus = new WebSocketBus(wss);

// Sensor info ingestion
app.use("/ingest", ingestRoutes(messageBus));

// REST CRUD
app.use("/api/sensors", sensorRoutes);
app.use("/api/maintenances", maintenanceRoutes);
app.use("/api/failures", failureRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/technicians", technicianRoutes); 

export default server;
