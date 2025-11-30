import { RequestHandler } from "express";
import prisma from "../../database/postgres.db";
import hasPermission from "../utils/permissionUtils";
import { UserRole } from "@prisma/client";

export const getAllIngenios: RequestHandler = async (req, res) => {
    try {
        // 0. Simple mode
        if (req.query.simple) {
            const ingenios = await prisma.ingenio.findMany({
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
                orderBy: {
                    name: 'asc'
                },
                where: {
                    active: true
                }
            });

            return res.json(ingenios);
        }

        // 1. Paginación
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 30;
        const skip = (page - 1) * limit;

        // 2. Parámetros de filtro
        const activeParam = req.query.active; // Recibimos el valor crudo
        const search = req.query.search?.toString()?.trim().toLowerCase();

        // 3. Construcción del Where
        // Usamos 'Prisma.IngenioWhereInput' si quieres tipado estricto, o any si prefieres flexibilidad rápida
        const where: any = {
            AND: []
        };

        // CORRECCIÓN FILTRO ACTIVE:
        // Solo filtramos si el parámetro viene definido.
        if (activeParam !== undefined) {
            const isActive = activeParam === 'true' || activeParam === 'yes';
            where.AND.push({ active: isActive });
        }

        // FILTRO DE BÚSQUEDA
        if (search) {
            where.AND.push({
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { code: { contains: search, mode: "insensitive" } },
                    { location: { contains: search, mode: "insensitive" } }
                ]
            });
        }

        // 4. Ejecución de la consulta (Transacción para consistencia)
        const [ingenios, total] = await prisma.$transaction([
            prisma.ingenio.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    id: 'asc' // o createdAt: 'desc'
                }
            }),
            prisma.ingenio.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            data: ingenios,
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
        console.error("Error al obtener ingenios", err);
        res.status(500).json({ error: "Error al obtener ingenios" });
    }
};

export const getIngenioById: RequestHandler = async (req, res) => {
    const id = Number(req.params.id);

    const ingenio = await prisma.ingenio.findUnique({
        where: { id },
    });

    if (!ingenio) {
        return res.status(404).json({ message: "Ingenio not found" });
    }

    res.json(ingenio);
};

export const createIngenio: RequestHandler = async (req, res) => {
    if (!hasPermission(req.session.user?.role as UserRole, UserRole.SUPERADMIN))
        return res.status(403).json({ message: "Forbidden access " });

    const { name, code, location } = req.body;

    if (!name || !code) {
        return res.status(400).json({ message: "name and code are required" });
    }

    const ingenio = await prisma.ingenio.create({
        data: { name, code, location },
    });

    res.status(201).json(ingenio);
};

export const updateIngenio: RequestHandler = async (req, res) => {

    const id = Number(req.params.id);
    if (!hasPermission(
        req.session.user?.role as UserRole,
        UserRole.ADMIN,
        { user: req.session.user?.ingenioId!, element: id }
    )) return res.status(403).json({ message: "Forbidden access " });

    const { name, code, location } = req.body;

    const ingenio = await prisma.ingenio.update({
        where: { id },
        data: { name, code, location },
    });

    res.json(ingenio);
};

export const deleteIngenio: RequestHandler = async (req, res) => {
    if (!hasPermission(req.session.user?.role as UserRole, UserRole.SUPERADMIN))
        return res.status(403).json({ message: "Forbidden access " });

    const id = Number(req.params.id);

    await prisma.ingenio.delete({
        where: { id },
    });

    res.status(204).send();
};

export const activateIngenio: RequestHandler = async (req, res) => {
    if (!hasPermission(req.session.user?.role as UserRole, UserRole.SUPERADMIN))
        return res.status(403).json({ message: "Forbidden access " });

    const id = Number(req.params.id);

    await prisma.ingenio.update({
        where: { id },
        data: { active: true },
    });

    res.status(204).send();
};

export const deactivateIngenio: RequestHandler = async (req, res) => {
    if (!hasPermission(req.session.user?.role as UserRole, UserRole.SUPERADMIN))
        return res.status(403).json({ message: "Forbidden access " });

    const id = Number(req.params.id);

    await prisma.ingenio.update({
        where: { id },
        data: { active: false },
    });

    res.status(204).send();
};
