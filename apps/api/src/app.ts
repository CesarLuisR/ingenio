import express from "express";
import cors from "cors";
import http from "http";
import ingestRoutes from "./lib/routes/ingestRoutes";
import { WebSocketServer } from "ws";
import { WebSocketBus } from "./lib/sockets/webSocket";
import session from "express-session";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // Set to true if using HTTPS with nginx
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true
    }
}))

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });
const messageBus = new WebSocketBus(wss);

import sensorRoutes from "./lib/routes/sensorRoutes";
import maintenanceRoutes from "./lib/routes/maintenanceRoutes";
import failureRoutes from "./lib/routes/failureRoutes";
import userRoutes from "./lib/routes/userRoutes";
import analyzeRoutes from "./lib/routes/analyzeRoutes";
import technicianRoutes from "./lib/routes/technicianRoutes";
import authRoutes from "./lib/routes/authRoutes";
import requireAuth from "./lib/middlewares/auth";

// Sensor info ingestion
app.use("/ingest", ingestRoutes(messageBus));

// REST CRUD
app.use("/api/sensors", requireAuth, sensorRoutes);
app.use("/api/maintenances", requireAuth, maintenanceRoutes);
app.use("/api/failures", requireAuth, failureRoutes);
app.use("/api/users", requireAuth, userRoutes);
app.use("/api/analyze", requireAuth, analyzeRoutes);
app.use("/api/technicians", requireAuth, technicianRoutes); 
app.use("/api/auth", authRoutes);

export default server;
