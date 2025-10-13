import express from "express";
import cors from "cors";
import http from "http";
import { createWebSocketServer } from "./lib/sockets/webSocket";
import ingestRoutes from "./lib/routes/ingestRoute";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = createWebSocketServer(server);

app.use((req, res, next) => {
    req.wss = wss;
    next();
});
app.use("/ingest", ingestRoutes);

export default server;
