import { RequestHandler } from "express";
import prisma from "../../database/postgres.db"; // Tu cliente prisma
import { Prisma, UserRole } from "@prisma/client";

export const getAuditLog: RequestHandler = async (req, res) => {
    try {
        const user = (req as any).session?.user;

        // 1. SEGURIDAD: Verificar sesión
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        // 2. OBTENER PARAMETROS (De query, NO de body)
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Filtros opcionales
        const { userId, action, entity, startDate, endDate } = req.query;

        // 3. CONSTRUIR FILTRO 'WHERE'
        const where: Prisma.AuditLogWhereInput = { AND: [] };

        // -- Seguridad de Tenant (Ingenio) --
        // Si NO es SuperAdmin, forzamos su ingenio.
        // Si ES SuperAdmin, dejamos que filtre si quiere, o ve todo.
        if (user.role !== UserRole.SUPERADMIN) {
            (where.AND as any[]).push({ ingenioId: user.ingenioId });
        } else if (req.query.ingenioId) {
            (where.AND as any[]).push({ ingenioId: Number(req.query.ingenioId) });
        }

        // -- Filtros Dinámicos --
        if (userId) (where.AND as any[]).push({ userId: Number(userId) });
        if (action) (where.AND as any[]).push({ action: String(action) });
        if (entity) (where.AND as any[]).push({ entity: String(entity) });

        // -- Filtro de Fecha --
        if (startDate || endDate) {
            const dateFilter: Prisma.DateTimeFilter = {};
            if (startDate) dateFilter.gte = new Date(String(startDate));
            if (endDate) dateFilter.lte = new Date(String(endDate));
            (where.AND as any[]).push({ createdAt: dateFilter });
        }

        // 4. EJECUTAR CONSULTA (Con Paginación)
        // Usamos Promise.all para obtener datos y total al mismo tiempo
        const [total, logs] = await Promise.all([
            prisma.auditLog.count({ where }),
            prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }, // Lo más reciente primero
                include: {
                    user: { // Traemos quién hizo la acción
                        select: { id: true, name: true, email: true, role: true }
                    }
                }
            })
        ]);

        // 5. SERIALIZACIÓN (BigInt Problem Fix)
        // Prisma devuelve BigInt para IDs, JSON.stringify falla con eso.
        // Lo convertimos a String antes de enviar.
        const safeLogs = JSON.parse(JSON.stringify(logs, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        // 6. RESPUESTA
        return res.json({
            data: safeLogs,
            meta: {
                totalItems: total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                itemsPerPage: limit
            }
        });

    } catch (err) {
        console.error("Error fetching audit logs:", err);
        // Nunca hagas throw new Error() en un controlador express async sin middleware de error handling global
        // Mejor devuelve un status 500
        return res.status(500).json({ message: "Error interno obteniendo auditoría" });
    }
}