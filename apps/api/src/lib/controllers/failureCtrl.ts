import prisma from "../../database/postgres.db";
import { Request, Response } from "express";
import hasPermission from "../utils/permissionUtils";
import { UserRole } from "@prisma/client";

export const getAllFailures = async (req: Request, res: Response) => {
    try {
        const failures = await prisma.failure.findMany({
            include: { sensor: true, maintenance: true },
            where: { ingenioId: req.session.user?.ingenioId },
        });
        res.json(failures);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener fallas" });
    }
};

export const getFailureById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const failure = await prisma.failure.findUnique({
            where: { id: Number(id) },
            include: { sensor: true, maintenance: true },
        });
        if (!failure) return res.status(404).json({ error: "Falla no encontrada" });
        res.json(failure);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la falla" });
    }
};

export const createFailure = async (req: Request, res: Response) => {
    if (!hasPermission(req.session.user?.role as UserRole, UserRole.TECNICO))
        return res.status(403).json({ message: "Forbidden access " });

    try {
        const { sensorId, description, severity, status, maintenanceId, ingenioId } = req.body;

        if (!sensorId || !description)
            return res
                .status(400)
                .json({ error: "sensorId y description son obligatorios" });

        const failure = await prisma.failure.create({
            data: {
                sensorId,
                description,
                severity,
                status,
                maintenanceId,
                ingenioId,
            },
        });

        res.status(201).json(failure);
    } catch (error) {
        res.status(500).json({ error: "Error al crear la falla" });
    }
};

export const updateFailure = async (req: Request, res: Response) => {
    if (!hasPermission(req.session.user?.role as UserRole, UserRole.TECNICO))
        return res.status(403).json({ message: "Forbidden access " });

    try {
        const { id } = req.params;
        const data = req.body;
        const updated = await prisma.failure.update({
            where: { id: Number(id) },
            data,
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la falla" });
    }
};

export const deleteFailure = async (req: Request, res: Response) => {
    if (!hasPermission(req.session.user?.role as UserRole, UserRole.TECNICO))
        return res.status(403).json({ message: "Forbidden access " });

    try {
        const { id } = req.params;
        await prisma.failure.delete({ where: { id: Number(id) } });
        res.json({ message: "Falla eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la falla" });
    }
};
