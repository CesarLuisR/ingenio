import { Request, Response } from "express";
import prisma from "../../database/postgres.db";
import { Prisma } from "@prisma/client"; // Necesario para tipos Decimal

// --- INTERFACES PARA TUS JSONB ---
// Esto evita errores de "Property does not exist on type JsonValue"
interface HourlyTotals {
    reliability?: number;
    mtbf?: number;
    mttr?: number;
    failuresCount?: number;
    // Agrega aquí cualquier otra métrica acumulada que guardes en el JSON
}

// --- HELPER: CÁLCULO DE LA HORA ACTUAL EN VIVO ---
// Calcula métricas desde el inicio de la hora actual hasta AHORA MISMO.
async function calculateLiveHourAvailability(ingenioId: number) {
    const now = new Date();
    const startOfHour = new Date(now);
    startOfHour.setMinutes(0, 0, 0); // Ej: 2:00:00 PM

    // 1. Contar máquinas activas en este Ingenio
    const machineCount = await prisma.machine.count({
        where: { 
            ingenioId: ingenioId, 
            active: true 
        }
    }) || 1; // Evitar división por cero si no hay máquinas

    // 2. Calcular tiempo total disponible (Capacidad Ideal)
    // (Milisegundos transcurridos en esta hora * cantidad de máquinas)
    const elapsedMs = now.getTime() - startOfHour.getTime();
    const totalCapacityMs = elapsedMs * machineCount;

    if (totalCapacityMs <= 0) return { availability: 100, failuresCount: 0 };

    // 3. Buscar fallas que impactan la hora actual
    const failures = await prisma.failure.findMany({
        where: {
            ingenioId: ingenioId,
            occurredAt: { lt: now }, // Ocurrieron antes de ahora
            OR: [
                { resolvedAt: null }, // Siguen abiertas
                { resolvedAt: { gt: startOfHour } } // Se resolvieron dentro de esta hora
            ]
        }
    });

    let totalDowntimeMs = 0;
    const winStart = startOfHour.getTime();
    const winEnd = now.getTime();

    // 4. Calcular intersección de tiempos (Matemática de tiempos)
    failures.forEach(f => {
        const failStart = new Date(f.occurredAt).getTime();
        // Si no está resuelta, asumimos que sigue fallando hasta "ahora"
        const failEnd = f.resolvedAt ? new Date(f.resolvedAt).getTime() : winEnd;

        // Clampear (recortar) la falla para que encaje en la ventana de esta hora
        const overlapStart = Math.max(failStart, winStart);
        const overlapEnd = Math.min(failEnd, winEnd);

        if (overlapStart < overlapEnd) {
            totalDowntimeMs += (overlapEnd - overlapStart);
        }
    });

    // 5. Calcular porcentaje
    // Aseguramos no restar más tiempo del posible (sanity check)
    const realDowntime = Math.min(totalDowntimeMs, totalCapacityMs);
    const availability = ((totalCapacityMs - realDowntime) / totalCapacityMs) * 100;

    return {
        availability: Number(availability.toFixed(2)),
        failuresCount: failures.length
    };
}

// ==========================================
// ENDPOINT 1: TARJETAS DE MÉTRICAS (KPIs)
// ==========================================
export const getIngenioMetrics = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.ingenioId);
        if (isNaN(id)) {
             res.status(400).json({ error: "Invalid ID" });
             return;
        }

        // A. Obtener el último registro histórico cerrado (para leer MTBF, MTTR calculados por el Cron)
        const lastRecord = await prisma.ingenioHourlyKPI.findFirst({
            where: { ingenioId: id },
            orderBy: { timestamp: 'desc' }
        });

        // B. Calcular Disponibilidad Ponderada (Últimas 24h)
        // Paso 1: Promedio de la base de datos (Histórico)
        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);

        const dbAgg = await prisma.ingenioHourlyKPI.aggregate({
            _avg: { availability: true },
            where: {
                ingenioId: id,
                timestamp: { gte: yesterday }
            }
        });

        // Paso 2: Dato en vivo (Hora actual)
        const liveData = await calculateLiveHourAvailability(id);

        // Paso 3: Unir ambos valores
        let finalAvailability = 100;

        if (dbAgg._avg.availability) {
            // Prisma devuelve Decimal, convertimos a Number
            const histVal = Number(dbAgg._avg.availability); 
            // Promedio simple entre "Historia reciente" y "Ahora mismo"
            // (Podrías ponderarlo: (histVal * 23 + liveData.availability) / 24)
            finalAvailability = (histVal + liveData.availability) / 2; 
        } else {
            // Si no hay historial, usamos solo lo que vemos ahora
            finalAvailability = liveData.availability;
        }

        // C. Extraer métricas del JSON (con seguridad de tipos)
        const totals = (lastRecord?.totals as HourlyTotals) || {};

        res.json({
            availability: Number(finalAvailability.toFixed(2)),
            reliability: totals.reliability ?? 100, 
            mtbf: totals.mtbf ?? 0,
            mttr: totals.mttr ?? 0,
            oee: lastRecord?.oee ? Number(lastRecord.oee) : 0
        });

    } catch (error) {
        console.error("Error en getIngenioMetrics:", error);
        res.status(500).json({ error: "Error interno del servidor calculando métricas" });
    }
};

// ==========================================
// ENDPOINT 2: GRÁFICO DE HISTORIAL
// ==========================================
export const getDashboardHistory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.ingenioId);
        const hoursToShow = 12; 

        // 1. Calcular fecha de corte
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - hoursToShow);

        // 2. Buscar en la Base de Datos (Ya calculado, rápido)
        const dbHistory = await prisma.ingenioHourlyKPI.findMany({
            where: {
                ingenioId: id,
                timestamp: { gte: cutoff }
            },
            orderBy: { timestamp: 'asc' }
        });

        // 3. Formatear datos de la DB
        const history = dbHistory.map(record => {
            const totals = (record.totals as HourlyTotals) || {};
            return {
                // Formato de hora legible (ej: 14:00)
                time: new Date(record.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                // Conversión explícita de Decimal a Number
                availability: Number(record.availability),
                failures: totals.failuresCount || 0
            };
        });

        // 4. Calcular y agregar la hora actual (EN VIVO)
        // Esto evita que la gráfica se vea "quieta" en la última hora cerrada
        const liveData = await calculateLiveHourAvailability(id);
        const now = new Date();
        
        history.push({
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            availability: liveData.availability,
            failures: liveData.failuresCount
        });

        // 5. Devolver solo la cantidad solicitada (cortando desde el final)
        res.json(history.slice(-hoursToShow));

    } catch (error) {
        console.error("Error en getDashboardHistory:", error);
        res.status(500).json({ error: "Error obteniendo historial" });
    }
};

// ==========================================
// ENDPOINT 3: ACTIVIDAD RECIENTE (LOGS)
// ==========================================
export const getRecentActivity = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.ingenioId);

        // Obtenemos fallas crudas recientes
        const failures = await prisma.failure.findMany({
            where: { ingenioId: id },
            take: 5,
            orderBy: { occurredAt: 'desc' },
            include: { 
                machine: { 
                    select: { name: true, code: true } 
                } 
            }
        });

        // Obtenemos mantenimientos crudos recientes
        const maintenances = await prisma.maintenance.findMany({
            where: { ingenioId: id },
            take: 5,
            orderBy: { performedAt: 'desc' },
            include: { 
                machine: { select: { name: true } }, 
                technician: { select: { name: true } } 
            }
        });

        // Unificamos en una sola lista
        const activity = [
            ...failures.map(f => ({
                id: `F-${f.id}`, // ID único para keys de React
                type: 'failure',
                title: f.description || 'Falla no descrita',
                machine: f.machine.name,
                status: f.resolvedAt ? 'resolved' : 'active',
                timestamp: f.occurredAt,
                severity: f.severity || 'low'
            })),
            ...maintenances.map(m => ({
                id: `M-${m.id}`,
                type: 'maintenance',
                title: m.type || 'Mantenimiento',
                machine: m.machine.name,
                status: 'completed',
                timestamp: m.performedAt,
                technician: m.technician?.name || 'N/A'
            }))
        ];

        // Ordenamos por fecha (el más reciente primero)
        activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Devolvemos solo los 10 items más recientes combinados
        res.json(activity.slice(0, 10));

    } catch (error) {
        console.error("Error en getRecentActivity:", error);
        res.status(500).json({ error: "Error obteniendo actividad reciente" });
    }
};