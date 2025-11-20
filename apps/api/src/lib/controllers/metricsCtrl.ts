import { RequestHandler } from "express";
import prisma from "../../database/postgres.db";
import { calculateMachineMetrics, calculateIngenioMetrics } from "../services/metricsService";

export const getMachineMetrics: RequestHandler = async (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Bad request" });

    try {
        const machine = await prisma.machine.findUnique({ where: { id } });
        if (!machine) return res.status(404).json({ error: "Machine no encontrada" });

        if (machine.ingenioId !== req.session.user?.ingenioId)
            return res.status(403).json({ message: "Forbidden access" });

        const result = await calculateMachineMetrics(machine.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Error calculando métricas" });
    }
};

export const getIngenioMetrics: RequestHandler = async (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Bad request" });

    try {
        const ingenio = await prisma.ingenio.findUnique({ where: { id } });
        if (!ingenio) return res.status(404).json({ error: "Ingenio no encontrado" });

        if (ingenio.id !== req.session.user?.ingenioId)
            return res.status(403).json({ message: "Forbidden access" });

        const result = await calculateIngenioMetrics(ingenio.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Error calculando métricas del ingenio" });
    }
};

export const getSensorHealth: RequestHandler = async (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Bad request" });

    try {
        const sensor = await prisma.sensor.findUnique({
            where: { id },
        });

        if (!sensor) return res.status(404).json({ error: "Sensor no encontrado" });

        if (sensor.ingenioId !== req.session.user?.ingenioId)
            return res.status(403).json({ message: "Forbidden access" });

        res.json({
            active: sensor.active,
            lastSeen: sensor.lastSeen,
            lastAnalysis: sensor.lastAnalysis,
        });
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo salud del sensor" });
    }
};
