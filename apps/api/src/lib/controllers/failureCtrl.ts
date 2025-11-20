import prisma from "../../database/postgres.db";
import { Request, Response } from "express";
import hasPermission from "../utils/permissionUtils";
import { UserRole } from "@prisma/client";

export const getAllFailures = async (req: Request, res: Response) => {
    try {
        const ingenioId = req.session.user?.ingenioId;

        const failures = await prisma.failure.findMany({
            where: { ingenioId },
            include: {
                machine: true,
                sensor: true,
                maintenance: true,
            },
        });

        res.json(failures);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener fallas" });
    }
};

export const getFailureById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const failure = await prisma.failure.findUnique({
            where: { id },
            include: {
                machine: true,
                sensor: true,
                maintenance: true,
            },
        });

        if (!failure) {
            return res.status(404).json({ error: "Falla no encontrada" });
        }

        // Validar acceso según ingenio
        if (
            !hasPermission(
                req.session.user?.role as UserRole,
                UserRole.LECTOR,
                { user: req.session.user?.ingenioId!, element: failure.ingenioId }
            )
        ) {
            return res.status(403).json({ message: "Forbidden access" });
        }

        res.json(failure);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la falla" });
    }
};

export const createFailure = async (req: Request, res: Response) => {
    // Solo técnicos o roles mayores
    if (!hasPermission(req.session.user?.role as UserRole, UserRole.TECNICO)) {
        return res.status(403).json({ message: "Forbidden access" });
    }

    try {
        const { machineId, sensorId, description, severity, status, maintenanceId } = req.body;
        const ingenioId = req.session.user?.ingenioId!;

        if (!machineId || !description) {
            return res
                .status(400)
                .json({ error: "machineId y description son obligatorios" });
        }

        // Validación: la máquina debe pertenecer al mismo ingenio
        const machine = await prisma.machine.findUnique({ where: { id: Number(machineId) } });

        if (!machine || machine.ingenioId !== ingenioId) {
            return res.status(403).json({ error: "No tienes acceso a esta máquina" });
        }

        const failure = await prisma.failure.create({
            data: {
                machineId: Number(machineId),
                sensorId: sensorId ? Number(sensorId) : null,
                description,
                severity,
                status,
                maintenanceId: maintenanceId ? Number(maintenanceId) : null,
                ingenioId,
            },
        });

        res.status(201).json(failure);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al crear la falla" });
    }
};

export const updateFailure = async (req: Request, res: Response) => {
    // Permiso mínimo: TECNICO
    if (!hasPermission(req.session.user?.role as UserRole, UserRole.TECNICO)) {
        return res.status(403).json({ message: "Forbidden access" });
    }

    try {
        const id = Number(req.params.id);
        const ingenioId = req.session.user?.ingenioId!;

        const failure = await prisma.failure.findUnique({ where: { id } });

        if (!failure) {
            return res.status(404).json({ error: "Falla no encontrada" });
        }

        // Validar acceso por ingenio
        if (failure.ingenioId !== ingenioId) {
            return res.status(403).json({ message: "Forbidden access" });
        }

        const updated = await prisma.failure.update({
            where: { id },
            data: req.body,
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la falla" });
    }
};

export const deleteFailure = async (req: Request, res: Response) => {
    if (!hasPermission(req.session.user?.role as UserRole, UserRole.TECNICO)) {
        return res.status(403).json({ message: "Forbidden access" });
    }

    try {
        const id = Number(req.params.id);
        const ingenioId = req.session.user?.ingenioId!;

        const failure = await prisma.failure.findUnique({ where: { id } });

        if (!failure) {
            return res.status(404).json({ error: "Falla no encontrada" });
        }

        if (failure.ingenioId !== ingenioId) {
            return res.status(403).json({ message: "Forbidden access" });
        }

        await prisma.failure.delete({ where: { id } });

        res.json({ message: "Falla eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la falla" });
    }
};
