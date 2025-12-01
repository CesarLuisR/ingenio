import prisma from "../../database/postgres.db";
import { Request, RequestHandler, Response } from "express";
import hasPermission from "../utils/permissionUtils";
import { Prisma, UserRole } from "@prisma/client";

export const getAllTechnicians: RequestHandler = async (req, res) => {
    try {
        const user = req.session.user;

        // 1. VALIDACIÓN DE SEGURIDAD
        if (!user || (user.role !== UserRole.SUPERADMIN && !user.ingenioId)) {
            return res.json({ 
                data: [], 
                meta: { totalItems: 0, totalPages: 0, currentPage: 1 } 
            });
        }

        // 2. BASE WHERE (Seguridad por Ingenio)
        const where: Prisma.TechnicianWhereInput = {
            AND: []
        };

        if (user.role !== UserRole.SUPERADMIN) {
            (where.AND as any[]).push({ ingenioId: user.ingenioId });
        } else {
            const { ingenioId } = req.query;
            if (ingenioId) {
                (where.AND as any[]).push({ ingenioId: Number(ingenioId) });
            }
        }

        // 3. MODO SIMPLE (Para Selects/Dropdowns)
        // Retorna solo ID y Nombre, solo activos.
        if (req.query.simple) {
            const technicians = await prisma.technician.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
                where: {
                    ...where,
                    active: true // Para asignar tareas, usualmente solo queremos los activos
                },
                orderBy: { name: 'asc' }
            });
            return res.json(technicians);
        }

        // --- FILTROS ESPECÍFICOS ---

        // A. Filtro por Estado (active)
        // ?active=true o ?active=false
        if (req.query.active !== undefined) {
            const isActive = req.query.active === 'true';
            (where.AND as any[]).push({ active: isActive });
        }

        // B. Filtro de Búsqueda (Search)
        // Busca en Nombre, Email y Teléfono
        const search = req.query.search?.toString()?.trim().toLowerCase();
        if (search) {
            (where.AND as any[]).push({
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                    { phone: { contains: search, mode: "insensitive" } }
                ]
            });
        }

        // --- PAGINACIÓN ---
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // --- ORDENAMIENTO ---
        const sortField = req.query.sortBy?.toString() || 'name';
        const sortDir: Prisma.SortOrder = req.query.sortDir?.toString() === 'desc' ? 'desc' : 'asc';
        
        // Mapeo seguro de campos de ordenamiento
        const orderBy: Prisma.TechnicianOrderByWithRelationInput = 
            ['name', 'email', 'createdAt'].includes(sortField)
                ? { [sortField]: sortDir }
                : { name: 'asc' };

        // --- EJECUCIÓN ---
        const [technicians, total] = await prisma.$transaction([
            prisma.technician.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    active: true,
                    // todo: quitar el comentario de abajo cuando se cree en la db
                    // createdAt: true,
                    // Optimización: No traemos el array 'maintenances' completo.
                    // Traemos solo el conteo para mostrar "Total trabajos: 15" en la tabla.
                    _count: {
                        select: { maintenances: true }
                    }
                },
                skip,
                take: limit,
                orderBy,
            }),
            prisma.technician.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            data: technicians,
            meta: {
                totalItems: total,
                currentPage: page,
                totalPages,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });

    } catch (error) {
        console.error("Error al obtener técnicos:", error);
        res.status(500).json({ error: "Error al procesar técnicos" });
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
        if (!hasPermission(
            req.session.user?.role as UserRole,
            UserRole.ADMIN,
        )) return res.status(403).json({ message: "Forbidden access" });

        const { name, email, phone, active, ingenioId } = req.body;

        if (!name)
            return res.status(400).json({ error: "El nombre es obligatorio" });

        const technician = await prisma.technician.create({
            data: { name, email, phone, active, ingenioId },
        });

        res.status(201).json(technician);
    } catch (error) {
        console.error("Error creating technician:", error);
        res.status(500).json({ error: "Error al crear técnico" });
    }
};

export const updateTechnician = async (req: Request, res: Response) => {
    try {
        if (!hasPermission(
            req.session.user?.role as UserRole,
            UserRole.ADMIN,
        )) return res.status(403).json({ message: "Forbidden access" });

        const { id } = req.params;
        const data = req.body;
        const updated = await prisma.technician.update({
            where: { id: Number(id) },
            data,
        });
        res.json(updated);
    } catch (error) {
        console.error("Error updating technician:", error);
        res.status(500).json({ error: "Error al actualizar técnico" });
    }
};

export const deleteTechnician = async (req: Request, res: Response) => {
    try {
        if (!hasPermission(
            req.session.user?.role as UserRole,
            UserRole.ADMIN,
        )) return res.status(403).json({ message: "Forbidden access" });

        const { id } = req.params;
        await prisma.technician.delete({ where: { id: Number(id) } });
        res.json({ message: "Técnico eliminado correctamente" });
    } catch (error) {
        console.error("Error deleting technician:", error);
        res.status(500).json({ error: "Error al eliminar técnico" });
    }
};
