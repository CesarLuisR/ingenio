import express from "express";
import cors from "cors";
import http from "http";
import ingestRoutes from "./lib/routes/ingestRoutes";
import { WebSocketServer } from "ws";
import { WebSocketBus } from "./lib/sockets/webSocket";
import session from "express-session";

const app = express();
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
export const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // Set to true if using HTTPS with nginx
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true
    }
});

app.use(sessionMiddleware);

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });
const messageBus = new WebSocketBus(wss);

import requireAuth from "./lib/middlewares/auth";

import sensorRoutes from "./lib/routes/sensorRoutes";
import maintenanceRoutes from "./lib/routes/maintenanceRoutes";
import failureRoutes from "./lib/routes/failureRoutes";
import userRoutes from "./lib/routes/userRoutes";
import analyzeRoutes from "./lib/routes/analyzeRoutes";
import technicianRoutes from "./lib/routes/technicianRoutes";
import authRoutes from "./lib/routes/authRoutes";
import ingenioRoutes from "./lib/routes/ingenioRoutes";
import metricsRoutes from "./lib/routes/metricsRoutes";
import machineRoutes from "./lib/routes/machineRoutes";
import dashboardRoutes from "./lib/routes/dashboardRoutes";
import reportRoutes from "./lib/routes/reportRoutes";
import auditLogRoutes from "./lib/routes/auditLogRoutes";
import { logger } from "./lib/middlewares/logger";

// Sensor info ingestion
app.use("/ingest", ingestRoutes(messageBus));

// REST CRUD
app.use("/api/auth", authRoutes);
app.use("/api/sensors", requireAuth, logger, sensorRoutes);
app.use("/api/maintenances", requireAuth, logger, maintenanceRoutes);
app.use("/api/failures", requireAuth, logger, failureRoutes);
app.use("/api/users", requireAuth, logger, userRoutes);
app.use("/api/analyze", requireAuth, logger, analyzeRoutes);
app.use("/api/technicians", requireAuth, logger, technicianRoutes); 
app.use("/api/ingenios", requireAuth, logger, ingenioRoutes);
app.use("/api/metrics", requireAuth, logger, metricsRoutes);
app.use("/api/machines", requireAuth, logger, machineRoutes);
app.use("/api/dashboard", requireAuth, logger, dashboardRoutes);
app.use("/api/reports", requireAuth, logger, reportRoutes);
app.use("/api/logs", requireAuth, logger, auditLogRoutes);

export default server;
