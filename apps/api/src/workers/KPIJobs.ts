import cron from "node-cron";
import prisma from "../database/postgres.db"; // Ajusta tu ruta
import { calculateMachineMetrics, calculateIngenioMetrics } from "../lib/services/metricsService"; // Ajusta ruta

async function runHourlyProcess() {
    console.log("⏰ Iniciando cálculo de KPIs horarios...", new Date().toISOString());

    const timestamp = new Date(); // La marca de tiempo para todos los registros de esta hora
    
    // ==========================================
    // 1. PROCESAR MÁQUINAS (NIVEL 1)
    // ==========================================
    const machines = await prisma.machine.findMany({
        where: { active: true },
        select: { id: true }
    });

    console.log(`📊 Procesando ${machines.length} máquinas...`);

    for (const m of machines) {
        try {
            // 1. Ejecutamos tu función de cálculo
            const metrics = await calculateMachineMetrics(m.id);

            // 2. Preparamos el JSON de métricas técnicas
            const technicalMetrics = {
                reliability: metrics.reliability,
                mtbf: metrics.mtbf,
                mttr: metrics.mttr,
                mtta: metrics.mtta
            };

            // 3. Guardamos en la tabla histórica (MachineHourlyKPI)
            await prisma.machineHourlyKPI.create({
                data: {
                    timestamp: timestamp,
                    machineId: m.id,
                    // Si availability es null (máquina nueva), asumimos 100% o 0% según tu lógica de negocio.
                    // Aquí pongo 100 si no hay fallas.
                    availability: metrics.availability ?? 100, 
                    
                    // Guardamos el resto de datos en el JSONB
                    processMetrics: technicalMetrics,

                    // Valores por defecto para columnas obligatorias si no las calculas aún
                    performance: 0,
                    quality: 0,
                    oee: 0
                }
            });
        } catch (error) {
            console.error(`❌ Error calculando máquina ${m.id}:`, error);
        }
    }

    // ==========================================
    // 2. PROCESAR INGENIOS (NIVEL 2 - ROLLUP)
    // ==========================================
    const ingenios = await prisma.ingenio.findMany({
        where: { active: true },
        select: { id: true }
    });

    console.log(`🏭 Procesando ${ingenios.length} ingenios...`);

    for (const ing of ingenios) {
        try {
            // Opción A: Usar tu función calculateIngenioMetrics (Calcula basado en fallas directas)
            const metrics = await calculateIngenioMetrics(ing.id);

            // Opción B (Más precisa para dashboards): Promediar los registros de MachineHourlyKPI que acabamos de crear
            // const aggregate = await prisma.machineHourlyKPI.aggregate({ ... })

            await prisma.ingenioHourlyKPI.create({
                data: {
                    timestamp: timestamp,
                    ingenioId: ing.id,
                    availability: metrics.availability ?? 100,
                    
                    // Guardamos métricas extras en el JSON de totales
                    totals: {
                        reliability: metrics.reliability,
                        mtbf: metrics.mtbf,
                        mttr: metrics.mttr
                    },
                    oee: 0 
                }
            });
        } catch (error) {
            console.error(`❌ Error calculando ingenio ${ing.id}:`, error);
        }
    }

    console.log("✅ Proceso horario finalizado.");
}

// ==========================================
// DEFINICIÓN DEL CRON
// ==========================================
export const kpiCronJob = () => {
    // Expresión Cron: "0 * * * *" significa "En el minuto 0 de cada hora"
    cron.schedule("0 * * * *", () => {
        runHourlyProcess();
    }, {
        timezone: "America/Santo_Domingo" // ¡Importante definir tu zona horaria!
    });
    
    console.log("🕒 Cron Job de KPIs programado (Cada hora en punto).");
};