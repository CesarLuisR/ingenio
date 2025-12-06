// services/reports/machineStatus.ts
import { PrismaClient, UserRole } from '@prisma/client';
import { ReportDefinition } from '../../../../types/reports';

const prisma = new PrismaClient();

export const machineStatusReport: ReportDefinition = {
    id: 'MACHINE_STATUS_SUMMARY',
    name: 'Resumen de Estado de Máquinas',
    description: 'Muestra un gráfico de pastel con la cantidad de máquinas activas vs inactivas en tiempo real.',
    requiredRoles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TECNICO, UserRole.LECTOR],

    generator: async (ctx, params) => {
        // Filtro base: Si el usuario es de un ingenio, solo ve sus máquinas
        const whereClause: any = {};
        if (ctx.ingenioId) {
            whereClause.ingenioId = ctx.ingenioId;
        }

        // Consulta Agrupada
        const stats = await prisma.machine.groupBy({
            by: ['active'],
            _count: { id: true },
            where: whereClause
        });

        // Transformar datos crudos (true/false) a algo legible para el UI
        const formattedData = stats.map(item => ({
            name: item.active ? 'Operativas' : 'Detenidas',
            value: item._count.id,
            fill: item.active ? '#4CAF50' : '#F44336' // Verde vs Rojo
        }));

        return {
            meta: {
                title: 'Estado Actual de la Flota',
                description: 'Distribución de máquinas operativas vs. paradas',
                type: 'PIE_CHART', // Perfecto para ver proporciones
                units: 'máquinas'
            },
            data: formattedData,
            generatedAt: new Date()
        };
    }
};