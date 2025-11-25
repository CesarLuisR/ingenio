import { Request, Response } from "express";
import prisma from "../../database/postgres.db"; 

// --- FUNCIÓN REUTILIZABLE DE CÁLCULO ---
async function calculateAvailability(ingenioId: number, hoursBack: number) {
    const now = new Date();
    const startTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

    // 1. Contamos máquinas activas (Capacidad total)
    const machineCount = await prisma.machine.count({
        where: { 
            // Asumiendo que hay relación ingenio -> machines o via sensores
            // Ajusta esto a tu esquema real. Si Machine no tiene ingenioId directo:
            sensors: { some: { ingenioId: ingenioId } },
            active: true 
        }
    }) || 1;

    // 2. Buscamos fallas en el rango
    const failures = await prisma.failure.findMany({
        where: {
            ingenioId: ingenioId,
            occurredAt: { lt: now },
            OR: [
                { resolvedAt: null },
                { resolvedAt: { gt: startTime } }
            ]
        }
    });

    let totalDowntimeMs = 0;
    const windowEnd = now.getTime();
    const windowStart = startTime.getTime();

    // 3. Sumamos tiempos muertos
    failures.forEach(f => {
        const failStart = new Date(f.occurredAt).getTime();
        const failEnd = f.resolvedAt ? new Date(f.resolvedAt).getTime() : windowEnd;

        const overlapStart = Math.max(failStart, windowStart);
        const overlapEnd = Math.min(failEnd, windowEnd);

        if (overlapStart < overlapEnd) {
            totalDowntimeMs += (overlapEnd - overlapStart);
        }
    });

    const totalCapacityMs = (windowEnd - windowStart) * machineCount;
    // Evitar negativos por datos sucios
    const realDowntime = Math.min(totalDowntimeMs, totalCapacityMs);
    
    const availability = ((totalCapacityMs - realDowntime) / totalCapacityMs) * 100;
    return Number(availability.toFixed(2));
}

// --- ENDPOINTS ---

export const getIngenioMetrics = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.ingenioId);

        // 1. Calcular Disponibilidad Real (24h) usando la función compartida
        const availability24h = await calculateAvailability(id, 24);

        // 2. Calcular otras métricas (Simuladas o reales según tu lógica)
        // MTBF, MTTR, Reliability... (Mantén tu lógica existente o usa placeholders)
        
        res.json({
            availability: availability24h, // ¡Ahora coincide con la gráfica!
            reliability: 98.5, // Ejemplo
            mtbf: 120,         // Ejemplo
            mttr: 2.5          // Ejemplo
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error metrics" });
    }
};

export const getDashboardHistory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.ingenioId);
        const now = new Date();
        const history = [];

        // Generamos las últimas 24 horas
        for (let i = 23; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 60 * 60 * 1000);
            const startOfHour = new Date(d); startOfHour.setMinutes(0, 0, 0);
            const endOfHour = new Date(d); endOfHour.setMinutes(59, 59, 999);

            // Aquí necesitamos calcular la disponibilidad DE ESA HORA ESPECÍFICA
            // Reutilizamos la lógica pero restringida a esa ventana de 1 hora
            
            // (Copiamos la lógica interna de calculateAvailability para 1 hora específica)
            // NOTA: En producción, sacar esto a una función helper para no repetir código.
            const machineCount = await prisma.machine.count({
                where: { sensors: { some: { ingenioId: id } }, active: true }
            }) || 1;

            const relevantFailures = await prisma.failure.findMany({
                where: {
                    ingenioId: id,
                    occurredAt: { lt: endOfHour },
                    OR: [{ resolvedAt: null }, { resolvedAt: { gt: startOfHour } }]
                }
            });

            let downtimeMs = 0;
            const winStart = startOfHour.getTime();
            const winEnd = endOfHour.getTime();

            relevantFailures.forEach(f => {
                const fs = new Date(f.occurredAt).getTime();
                const fe = f.resolvedAt ? new Date(f.resolvedAt).getTime() : now.getTime(); // Ojo: si es futuro no cuenta, pero estamos en historial
                const effectiveEnd = Math.min(fe, winEnd); // No contar futuro si estamos en la hora actual

                const os = Math.max(fs, winStart);
                const oe = Math.min(fe, winEnd);

                if (os < oe) downtimeMs += (oe - os);
            });

            const cap = (winEnd - winStart) * machineCount;
            const val = ((cap - Math.min(downtimeMs, cap)) / cap) * 100;

            history.push({
                time: `${startOfHour.getHours()}:00`,
                availability: Number(val.toFixed(2)),
                failures: relevantFailures.filter(f => f.occurredAt >= startOfHour && f.occurredAt <= endOfHour).length
            });
        }

        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error history" });
    }
};

// ... getRecentActivity se mantiene igual

export const getRecentActivity = async (req: Request, res: Response) => {
    try {
        const { ingenioId } = req.params;
        const id = Number(ingenioId);

        const failures = await prisma.failure.findMany({
            where: { ingenioId: id },
            take: 5,
            orderBy: { occurredAt: 'desc' },
            include: { machine: { select: { name: true } } }
        });

        const maintenances = await prisma.maintenance.findMany({
            where: { ingenioId: id },
            take: 5,
            orderBy: { performedAt: 'desc' },
            include: { machine: { select: { name: true } }, technician: { select: { name: true } } }
        });

        const activity = [
            ...failures.map(f => ({
                id: `F-${f.id}`,
                type: 'failure',
                title: f.description,
                machine: f.machine.name,
                status: f.status,
                timestamp: f.occurredAt,
                meta: f.severity
            })),
            ...maintenances.map(m => ({
                id: `M-${m.id}`,
                type: 'maintenance',
                title: m.type,
                machine: m.machine.name,
                status: 'completed',
                timestamp: m.performedAt,
                meta: m.technician?.name || 'Sin asignar'
            }))
        ];

        activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        res.json(activity.slice(0, 6));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching activity" });
    }
};