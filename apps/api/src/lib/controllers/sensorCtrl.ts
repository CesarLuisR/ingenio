import prisma from "../../database/postgres.db";
import { Request, Response } from "express";

export const getAllSensors = async (req: Request, res: Response) => {
    const sensors = await prisma.sensor.findMany({
        include: { maintenances: true, failures: true },
    });
    res.json(sensors);
};

export const getSensorById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const sensor = await prisma.sensor.findUnique({
        where: { id: Number(id) },
        include: { maintenances: true, failures: true },
    });
    if (!sensor) return res.status(404).json({ message: "Sensor not found" });
    res.json(sensor);
};

export const createSensor = async (req: Request, res: Response) => {
    const { sensorId, name, type, metricsConfig } = req.body;
    const sensor = await prisma.sensor.create({
        data: { sensorId, name, type, metricsConfig },
    });
    res.status(201).json(sensor);
};

export const updateSensor = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const sensor = await prisma.sensor.update({
        where: { id: Number(id) },
        data,
    });
    res.json(sensor);
};

export const deleteSensor = async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.sensor.delete({ where: { id: Number(id) } });
    res.status(204).send();
};
