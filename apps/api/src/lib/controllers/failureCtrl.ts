import prisma from "../../database/postgres.db";
import { Request, RequestHandler, Response } from "express";
import hasPermission from "../utils/permissionUtils";
import { Prisma, UserRole } from "@prisma/client";


export const getAllFailures: RequestHandler = async (req, res) => {
    try {
        const user = req.session.user;

        // 1. VALIDACIÓN DE SEGURIDAD Y CONTEXTO
        if (!user || (user.role !== UserRole.SUPERADMIN && !user.ingenioId)) {
            return res.json({ 
                data: [], 
                meta: { totalItems: 0, totalPages: 0, currentPage: 1 } 
            });
        }

        // 2. CONSTRUCCIÓN DEL WHERE BASE (ROLES)
        // Inicializamos el objeto de filtros
        const where: Prisma.FailureWhereInput = {
            AND: []
        };

        // Regla: Si no eres SuperAdmin, solo ves tu Ingenio.
        if (user.role !== UserRole.SUPERADMIN) {
            (where.AND as any[]).push({ ingenioId: user.ingenioId });
        } else {
            // SuperAdmin puede filtrar manualmente por ingenio si quiere
            const { ingenioId } = req.query;
            if (ingenioId) {
                (where.AND as any[]).push({ ingenioId: Number(ingenioId) });
            }
        }

        // 3. MODO SIMPLE (Para Dropdowns/Selects)
        // ---------------------------------------------------------
        // Retorna lista ligera: sin paginación, sin relaciones pesadas.
        if (req.query.simple) {
            const failures = await prisma.failure.findMany({
                select: {
                    id: true,
                    description: true,
                },
                where: {
                    ...where, // Mantiene la seguridad del rol
                    // Opcional: Si el dropdown es para "asignar", quizás solo quieras las pendientes
                    // status: { not: 'resuelto' } 
                },
                orderBy: {
                    occurredAt: 'desc' // Las más recientes primero
                },
                take: 100 // Límite de seguridad para no explotar el dropdown si hay miles
            });
            return res.json(failures);
        }

        // 4. FILTROS AVANZADOS

        // A. Filtro por Máquina
        if (req.query.machineId) {
            (where.AND as any[]).push({ machineId: Number(req.query.machineId) });
        }

        // B. Filtro por Sensor
        if (req.query.sensorId) {
            (where.AND as any[]).push({ sensorId: Number(req.query.sensorId) });
        }

        // C. Filtro por Severidad (HIGH, MEDIUM, LOW)
        if (req.query.severity) {
            (where.AND as any[]).push({ severity: req.query.severity.toString() });
        }

        // D. Filtro por Estado (pendiente, en_progreso, resuelto)
        if (req.query.status) {
            (where.AND as any[]).push({ status: req.query.status.toString() });
        }

        // E. Búsqueda Global (Search)
        const search = req.query.search?.toString()?.trim().toLowerCase();
        if (search) {
            (where.AND as any[]).push({
                OR: [
                    { description: { contains: search, mode: "insensitive" } },
                    // Buscamos dentro de la relación con Machine
                    { machine: { name: { contains: search, mode: "insensitive" } } },
                    { machine: { code: { contains: search, mode: "insensitive" } } },
                    // Buscamos dentro de la relación con Sensor
                    { sensor: { name: { contains: search, mode: "insensitive" } } }
                ]
            });
        }

        // 5. PAGINACIÓN Y ORDENAMIENTO
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const sortField = req.query.sortBy?.toString() || 'occurredAt';
        const sortDir: Prisma.SortOrder = req.query.sortDir?.toString() === 'asc' ? 'asc' : 'desc';

        // Mapeo de ordenamiento
        let orderBy: Prisma.FailureOrderByWithRelationInput = {};
        
        switch (sortField) {
            case 'machine':
                orderBy = { machine: { name: sortDir } };
                break;
            case 'sensor':
                orderBy = { sensor: { name: sortDir } };
                break;
            case 'severity':
            case 'status':
            case 'description':
            case 'occurredAt':
                orderBy = { [sortField]: sortDir };
                break;
            default:
                orderBy = { occurredAt: 'desc' };
        }

        // ---------------------------------------------------------
        // 6. EJECUCIÓN (TRANSACTION)
        // ---------------------------------------------------------
        const [failures, total] = await prisma.$transaction([
            prisma.failure.findMany({
                where,
                include: {
                    machine: {
                        select: { id: true, name: true, code: true, location: true }
                    },
                    sensor: {
                        select: { id: true, name: true, type: true }
                    },
                    maintenance: {
                        select: { id: true, performedAt: true, technician: { select: { name: true } } }
                    }
                },
                skip,
                take: limit,
                orderBy,
            }),
            prisma.failure.count({ where })
        ]);

        // ---------------------------------------------------------
        // 7. RESPUESTA ESTÁNDAR
        // ---------------------------------------------------------
        const totalPages = Math.ceil(total / limit);

        res.json({
            data: failures,
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
        console.error("Error al obtener fallas:", error);
        res.status(500).json({ error: "Error interno al procesar fallas" });
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
