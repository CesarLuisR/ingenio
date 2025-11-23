import { Request, Response } from "express";
import prisma from "../../database/postgres.db"; 

export const getDashboardHistory = async (req: Request, res: Response) => {
    try {
        const { ingenioId } = req.params;
        const id = Number(ingenioId);

        // 1. Generar las últimas 24 horas (etiquetas)
        const now = new Date();
        const history = [];
        
        for (let i = 23; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 60 * 60 * 1000);
            
            // Buscamos fallas que ocurrieron en esa hora específica
            const startOfHour = new Date(d);
            startOfHour.setMinutes(0, 0, 0);
            const endOfHour = new Date(d);
            endOfHour.setMinutes(59, 59, 999);

            // Contamos fallas en esa hora para este ingenio
            const failuresCount = await prisma.failure.count({
                where: {
                    ingenioId: id,
                    occurredAt: {
                        gte: startOfHour,
                        lte: endOfHour
                    }
                }
            });

            // ALGORITMO SIMPLE DE ESTIMACIÓN:
            // Base 100%. Cada falla en esa hora resta un porcentaje arbitrario (ej. 2%)
            // En un sistema real, esto se calcula con segundos exactos de downtime.
            let availability = 100 - (failuresCount * 2); 
            if (availability < 0) availability = 0;

            history.push({
                time: `${startOfHour.getHours()}:00`,
                availability: availability,
                failures: failuresCount
            });
        }

        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error generating history" });
    }
};

export const getRecentActivity = async (req: Request, res: Response) => {
    try {
        const { ingenioId } = req.params;
        const id = Number(ingenioId);

        // 1. Obtener últimas 5 fallas
        const failures = await prisma.failure.findMany({
            where: { ingenioId: id },
            take: 5,
            orderBy: { occurredAt: 'desc' },
            include: { machine: { select: { name: true } } }
        });

        // 2. Obtener últimos 5 mantenimientos
        const maintenances = await prisma.maintenance.findMany({
            where: { ingenioId: id },
            take: 5,
            orderBy: { performedAt: 'desc' },
            include: { machine: { select: { name: true } }, technician: { select: { name: true } } }
        });

        // 3. Unificar y estandarizar
        const activity = [
            ...failures.map(f => ({
                id: `F-${f.id}`,
                type: 'failure',
                title: f.description,
                machine: f.machine.name,
                status: f.status, // pendiente, resuelta
                timestamp: f.occurredAt,
                meta: f.severity // info extra
            })),
            ...maintenances.map(m => ({
                id: `M-${m.id}`,
                type: 'maintenance',
                title: m.type, // Preventivo, Correctivo
                machine: m.machine.name,
                status: 'completed', // Asumimos completado por ser historial
                timestamp: m.performedAt,
                meta: m.technician?.name || 'Sin asignar'
            }))
        ];

        // 4. Ordenar por fecha descendente y cortar a 6 items
        activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const finalFeed = activity.slice(0, 6);

        res.json(finalFeed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching activity" });
    }
};