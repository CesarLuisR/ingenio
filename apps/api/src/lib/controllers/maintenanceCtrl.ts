import prisma from "../../database/postgres.db";
import { Request, Response } from "express";
import hasPermission from "../utils/permissionUtils";
import { UserRole } from "@prisma/client";

export const getAllMaintenances = async (req: Request, res: Response) => {
    try {
        const ingenioId = req.session.user?.ingenioId;
        if (!ingenioId) {
            throw new Error("Not authenticated");
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 30;
        const skip = (page - 1) * limit;

        type OrderType = "asc" | "desc" | undefined;
        const raw = req.query.order?.toString();
        const order: OrderType = raw === "asc" || raw == "desc" ? raw : undefined;

        const [maintenances, total] = await prisma.$transaction([
            prisma.maintenance.findMany({
                where: { ingenioId },
                include: {
                    machine: true,
                    technician: true,
                    failures: true
                },
                skip: skip,
                take: limit,
                orderBy: { performedAt: order }
            }),
            prisma.maintenance.count({
                where: { ingenioId }
            })
        ]);

        const totalPages = Math.ceil(total / limit);
        res.json({
            data: maintenances,
            meta: {
                totalItems: total,
                currentPage: page,
                totalPages: totalPages,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        console.error("Error al obtener mantenimientos:", error);
        res.status(500).json({ error: "Error al obtener mantenimientos" });
    }
};

export const getMaintenanceById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const maintenance = await prisma.maintenance.findUnique({
            where: { id },
            include: {
                machine: true,
                technician: true,
                failures: true,
            },
        });

        if (!maintenance)
            return res.status(404).json({ error: "Mantenimiento no encontrado" });

        // Validación de acceso por ingenio
        if (
            !hasPermission(
                req.session.user?.role as UserRole,
                UserRole.LECTOR,
                { user: req.session.user?.ingenioId!, element: maintenance.ingenioId }
            )
        ) {
            return res.status(403).json({ message: "Forbidden access" });
        }

        res.json(maintenance);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener mantenimiento" });
    }
};

export const createMaintenance = async (req: Request, res: Response) => {
    if (!hasPermission(req.session.user?.role as UserRole, UserRole.TECNICO))
        return res.status(403).json({ message: "Forbidden access " });

    try {
        const { machineId, type, technicianId, durationMinutes, notes, cost } = req.body;
        const ingenioId = req.session.user?.ingenioId!;

        if (!machineId || !type) {
            return res.status(400).json({
                error: "machineId y type son campos obligatorios",
            });
        }

        // Verificar que la máquina pertenezca al mismo ingenio
        const machine = await prisma.machine.findUnique({
            where: { id: Number(machineId) },
        });

        if (!machine || machine.ingenioId !== ingenioId) {
            return res.status(403).json({
                error: "No tienes acceso a esta máquina",
            });
        }

        const maintenance = await prisma.maintenance.create({
            data: {
                machineId: Number(machineId),
                type,
                technicianId: technicianId ? Number(technicianId) : null,
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

export const updateMaintenance = async (req: Request, res: Response) => {
    if (!hasPermission(req.session.user?.role as UserRole, UserRole.TECNICO))
        return res.status(403).json({ message: "Forbidden access " });

    try {
        const id = Number(req.params.id);
        const ingenioId = req.session.user?.ingenioId!;

        const maintenance = await prisma.maintenance.findUnique({ where: { id } });

        if (!maintenance)
            return res.status(404).json({ error: "Mantenimiento no encontrado" });

        if (maintenance.ingenioId !== ingenioId) {
            return res.status(403).json({ message: "Forbidden access" });
        }

        const updated = await prisma.maintenance.update({
            where: { id },
            data: req.body,
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar mantenimiento" });
    }
};

export const deleteMaintenance = async (req: Request, res: Response) => {
    if (!hasPermission(req.session.user?.role as UserRole, UserRole.TECNICO))
        return res.status(403).json({ message: "Forbidden access " });

    try {
        const id = Number(req.params.id);
        const ingenioId = req.session.user?.ingenioId!;

        const maintenance = await prisma.maintenance.findUnique({ where: { id } });

        if (!maintenance)
            return res.status(404).json({ error: "Mantenimiento no encontrado" });

        if (maintenance.ingenioId !== ingenioId) {
            return res.status(403).json({ message: "Forbidden access" });
        }

        await prisma.maintenance.delete({ where: { id } });

        res.json({ message: "Mantenimiento eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar mantenimiento" });
    }
};
