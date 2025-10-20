import prisma from "../../database/postgres.db";
import { Request, Response } from "express";

export const getAllFailures = async (req: Request, res: Response) => {
    const failures = await prisma.failure.findMany({
        include: { sensor: true },
    });
    res.json(failures);
};

export const createFailure = async (req: Request, res: Response) => {
    const { sensorId, description } = req.body;
    const failure = await prisma.failure.create({
        data: { sensorId, description },
    });
    res.status(201).json(failure);
};
