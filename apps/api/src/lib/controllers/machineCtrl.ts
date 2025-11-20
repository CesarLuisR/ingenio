import { RequestHandler } from "express";
import prisma from "../../database/postgres.db";
import hasPermission from "../utils/permissionUtils";
import { UserRole } from "@prisma/client";

export const getAllMachines: RequestHandler = async (req, res) => {
    const ingenioId = req.session.user?.ingenioId;

    // Un ADMIN, TECNICO o LECTOR solo debe ver máquinas de su ingenio
    const machines = await prisma.machine.findMany({
        where: { ingenioId },
        include: { maintenances: true, sensors: true, failures: true }
    });

    res.json(machines);
};

export const getMachineById: RequestHandler = async (req, res) => {
    const id = Number(req.params.id);
    const ingenioId = req.session.user?.ingenioId;

    const machine = await prisma.machine.findUnique({
        where: { id },
        include: { maintenances: true, sensors: true, failures: true }
    });

    if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
    }

    // Check access: machine must belong to same ingenio
    if (
        !hasPermission(
            req.session.user?.role as UserRole,
            UserRole.LECTOR,
            { user: ingenioId!, element: machine.ingenioId }
        )
    ) {
        return res.status(403).json({ message: "Forbidden access" });
    }

    res.json(machine);
};

export const createMachine: RequestHandler = async (req, res) => {
    const { name, code, type, location, description } = req.body;
    const ingenioId = req.session.user?.ingenioId;

    if (!ingenioId) {
        return res.status(403).json({ message: "Forbidden access" });
    }

    // Only ADMIN or SUPERADMIN can create machines
    if (!hasPermission(req.session.user?.role as UserRole, UserRole.ADMIN)) {
        return res.status(403).json({ message: "Forbidden access" });
    }

    if (!name || !code) {
        return res.status(400).json({ message: "name and code are required" });
    }

    const machine = await prisma.machine.create({
        data: {
            name,
            code,
            type,
            description,
            location,
            ingenioId,
        },
    });

    res.status(201).json(machine);
};

export const updateMachine: RequestHandler = async (req, res) => {
    const id = Number(req.params.id);
    const { name, code, type, location, active, description } = req.body;
    const ingenioId = req.session.user?.ingenioId;

    const machine = await prisma.machine.findUnique({ where: { id } });

    if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
    }

    // Must belong to the same ingenio
    if (
        !hasPermission(
            req.session.user?.role as UserRole,
            UserRole.ADMIN,
            { user: ingenioId!, element: machine.ingenioId }
        )
    ) {
        return res.status(403).json({ message: "Forbidden access" });
    }

    const updated = await prisma.machine.update({
        where: { id },
        data: { name, code, type, location, active, description },
    });

    res.json(updated);
};

export const deleteMachine: RequestHandler = async (req, res) => {
    const id = Number(req.params.id);

    // Only SUPERADMIN can delete machines
    if (!hasPermission(req.session.user?.role as UserRole, UserRole.SUPERADMIN)) {
        return res.status(403).json({ message: "Forbidden access" });
    }

    await prisma.machine.delete({
        where: { id },
    });

    res.status(204).send();
};
