import prisma from "../../database/postgres.db";
import { Request, Response } from "express";

export const getAllTechnicians = async (req: Request, res: Response) => {
    try {
        const technicians = await prisma.technician.findMany({
            include: { maintenances: true },
        });
        res.json(technicians);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener técnicos" });
    }
};

export const getTechnicianById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const technician = await prisma.technician.findUnique({
            where: { id: Number(id) },
            include: { maintenances: true },
        });
        if (!technician)
            return res.status(404).json({ error: "Técnico no encontrado" });
        res.json(technician);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener técnico" });
    }
};

export const createTechnician = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, active } = req.body;

        if (!name)
            return res.status(400).json({ error: "El nombre es obligatorio" });

        const technician = await prisma.technician.create({
            data: { name, email, phone, active },
        });

        res.status(201).json(technician);
    } catch (error) {
        res.status(500).json({ error: "Error al crear técnico" });
    }
};

export const updateTechnician = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updated = await prisma.technician.update({
            where: { id: Number(id) },
            data,
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar técnico" });
    }
};

export const deleteTechnician = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.technician.delete({ where: { id: Number(id) } });
        res.json({ message: "Técnico eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar técnico" });
    }
};
