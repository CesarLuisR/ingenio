import prisma from "../../database/postgres.db";
import { Request, Response } from "express";

export const getAllMaintenances = async (req: Request, res: Response) => {
    const maintenances = await prisma.maintenance.findMany({
        include: { sensor: true },
    });
    res.json(maintenances);
};

export const createMaintenance = async (req: Request, res: Response) => {
    const { sensorId, notes } = req.body;
    const maintenance = await prisma.maintenance.create({
        data: { sensorId, notes },
    });
    res.status(201).json(maintenance);
};
