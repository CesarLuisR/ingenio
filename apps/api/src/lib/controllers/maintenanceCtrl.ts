import prisma from "../../database/postgres.db";
import { Request, Response } from "express";

// Obtener todos los mantenimientos
export const getAllMaintenances = async (req: Request, res: Response) => {
    try {
        const maintenances = await prisma.maintenance.findMany({
            include: { sensor: true, technician: true, failures: true },
            where: { ingenioId: req.session.user?.ingenioId },
        });
        res.json(maintenances);
    } catch (error) {
        console.error("Error al obtener mantenimientos:", error);
        res.status(500).json({ error: "Error al obtener mantenimientos" });
    }
};

// Obtener mantenimiento por ID
export const getMaintenanceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const maintenance = await prisma.maintenance.findUnique({
            where: { id: Number(id) },
            include: { sensor: true, technician: true, failures: true },
        });
        if (!maintenance)
            return res.status(404).json({ error: "Mantenimiento no encontrado" });
        res.json(maintenance);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener mantenimiento" });
    }
};

// Crear un nuevo mantenimiento
export const createMaintenance = async (req: Request, res: Response) => {
    try {
        const { sensorId, type, technicianId, durationMinutes, notes, cost, ingenioId } =
            req.body;

        if (!sensorId || !type)
            return res
                .status(400)
                .json({ error: "sensorId y type son campos obligatorios" });

        const maintenance = await prisma.maintenance.create({
            data: {
                sensorId,
                type,
                technicianId,
                durationMinutes,
                notes,
                cost,
                ingenioId,
            },
        });

        res.status(201).json(maintenance);
    } catch (error) {
        console.error("Error al crear mantenimiento:", error);
        res.status(500).json({ error: "Error al crear mantenimiento" });
    }
};

// Actualizar mantenimiento
export const updateMaintenance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updated = await prisma.maintenance.update({
            where: { id: Number(id) },
            data,
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar mantenimiento" });
    }
};

// Eliminar mantenimiento
export const deleteMaintenance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.maintenance.delete({ where: { id: Number(id) } });
        res.json({ message: "Mantenimiento eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar mantenimiento" });
    }
};
