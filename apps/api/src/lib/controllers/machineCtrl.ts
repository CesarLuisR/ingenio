import { RequestHandler } from "express";
import prisma from "../../database/postgres.db";
import hasPermission from "../utils/permissionUtils";
import { Prisma, UserRole } from "@prisma/client";

export const getAllMachines: RequestHandler = async (req, res) => {
    try {
        const user = req.session.user;

        // 1. VALIDACIÓN DE SEGURIDAD (Base)
        // Si no hay usuario o si no es SuperAdmin y no tiene ingenio, retornamos vacío
        if (!user || (user.role !== UserRole.SUPERADMIN && !user.ingenioId)) {
            return res.json({ data: [], meta: { totalItems: 0, totalPages: 0, currentPage: 1 } });
        }

        // --- CONSTRUCCIÓN DEL WHERE BASE (ROLES) ---
        const where: any = {
            AND: []
        };

        if (user.role !== UserRole.SUPERADMIN) {
            // ADMIN, TECNICO, LECTOR: Forzamos su ingenio
            where.AND.push({ ingenioId: user.ingenioId });
        } else {
            // SUPERADMIN: Puede filtrar por ingenio específico si quiere
            const { ingenioId } = req.query;
            if (ingenioId) {
                where.AND.push({ ingenioId: Number(ingenioId) });
            }
        }

        // --- 2. MODO SIMPLE (Para Dropdowns/Selects) ---
        // Retorna lista ligera sin paginación ni relaciones pesadas
        if (req.query.simple) {
            const machines = await prisma.machine.findMany({
                select: {
                    id: true,
                    name: true,
                    code: true,
                    active: true, // Útil saber si está activa en el dropdown
                    ingenioId: true
                },
                where: {
                    ...where, // Mantenemos restricción de rol/ingenio
                    active: true // Usualmente en dropdowns solo queremos las activas
                },
                orderBy: {
                    name: 'asc'
                }
            });
            return res.json(machines);
        }

        // --- 3. PARÁMETROS DE PAGINACIÓN ---
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // --- 4. PARÁMETROS DE ORDENAMIENTO ---
        const sortField = req.query.sortBy?.toString() || 'createdAt';
        // 2. Forzamos el tipo a Prisma.SortOrder ('asc' | 'desc')
        const sortDir: Prisma.SortOrder = req.query.sortDir?.toString() === 'desc' ? 'desc' : 'asc';

        const validSortFields = ['name', 'code', 'createdAt', 'updatedAt'];

        // 3. Tipamos explícitamente el objeto orderBy
        // Esto le dice a TS: "Confía en mí, este objeto dinámico cumple con el tipo de Prisma"
        const orderBy: Prisma.MachineOrderByWithRelationInput = validSortFields.includes(sortField)
            ? { [sortField]: sortDir }
            : { createdAt: 'desc' };

        // --- 5. FILTROS (Search & Active) ---

        // Filtro: Activas / Inactivas
        const activeParam = req.query.active;
        if (activeParam !== undefined) {
            const isActive = activeParam === 'true' || activeParam === 'yes';
            where.AND.push({ active: isActive });
        }

        // Filtro: Búsqueda (Search)
        const search = req.query.search?.toString()?.trim().toLowerCase();
        if (search) {
            where.AND.push({
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { code: { contains: search, mode: "insensitive" } },
                    { location: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } }
                ]
            });
        }

        // --- 6. EJECUCIÓN (Transacción) ---
        const [machines, total] = await prisma.$transaction([
            prisma.machine.findMany({
                where,
                include: {
                    maintenances: true,
                    sensors: true,
                    failures: true
                },
                skip,
                take: limit,
                orderBy
            }),
            prisma.machine.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        // --- 7. RESPUESTA ---
        res.json({
            data: machines,
            meta: {
                totalItems: total,
                currentPage: page,
                totalPages,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });

    } catch (err) {
        console.error("Error al obtener máquinas:", err);
        res.status(500).json({ error: "Error al obtener máquinas" });
    }
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
