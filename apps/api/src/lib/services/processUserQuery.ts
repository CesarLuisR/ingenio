import { ReportContext, ReportParams } from '../../types/reports';
import { UserRole } from '@prisma/client';
import { decideReportWithGemini } from '../services/reports/geminiDispatcher';
import { REPORT_REGISTRY } from '../services/reports/reportRegistry';

export type AIControllerResponse =
    | {
        type: 'WIDGET';
        // todo: por ahora para que no falle
        payload: any;
        debug?: { aiParams: any; reportId: string }; // Útil para depurar
    }
    | {
        type: 'TEXT';
        message: string;
    }
    | {
        type: 'ERROR';
        message: string;
    };


export async function processUserQuery(
    user: { id: number; role: UserRole; ingenioId?: number | null },
    query: string
): Promise<AIControllerResponse> {

    try {
        // ---------------------------------------------------------
        // PASO 1: Consultar a Gemini (El Cerebro)
        // ---------------------------------------------------------
        console.log(`[AI-Controller] Procesando query: "${query}" para usuario ${user.id}`);
        const aiDecision = await decideReportWithGemini(query);

        // Si la IA dice null, es que no entendió o es charla casual
        if (!aiDecision.reportId) {
            return {
                type: 'TEXT',
                message: "Lo siento, no tengo un reporte específico para esa consulta. Intenta preguntar por 'estado de máquinas', 'OEE' o 'fallas'."
            };
        }

        // ---------------------------------------------------------
        // PASO 2: Validar Existencia del Reporte (Anti-Alucinación)
        // ---------------------------------------------------------
        const reportDef = REPORT_REGISTRY[aiDecision.reportId];

        if (!reportDef) {
            console.warn(`[AI-Controller] Gemini alucinó un ID no existente: ${aiDecision.reportId}`);
            return {
                type: 'TEXT',
                message: "Entendí tu intención, pero el reporte solicitado no está disponible temporalmente."
            };
        }

        // ---------------------------------------------------------
        // PASO 3: Capa de Seguridad (RBAC - Role Based Access Control)
        // ---------------------------------------------------------
        if (!reportDef.requiredRoles.includes(user.role)) {
            console.warn(`[Security] Usuario ${user.id} (${user.role}) intentó acceder a ${reportDef.id}`);
            return {
                type: 'ERROR',
                message: `No tienes permisos suficientes (${user.role}) para ver el reporte: "${reportDef.name}".`
            };
        }

        // ---------------------------------------------------------
        // PASO 4: Preparar Contexto y Ejecutar
        // ---------------------------------------------------------
        const context: ReportContext = {
            userId: user.id,
            userRole: user.role,
            ingenioId: user.ingenioId || undefined
        };

        // Los params vienen de la IA, pero aseguramos que sean un objeto
        const params: ReportParams = aiDecision.params || {};

        console.log(`[AI-Controller] Ejecutando ${reportDef.id} con params:`, params);

        // EJECUCIÓN REAL A BASE DE DATOS
        const reportData = await reportDef.generator(context, params);

        // ---------------------------------------------------------
        // PASO 5: Retorno Exitoso
        // ---------------------------------------------------------
        return {
            type: 'WIDGET',
            payload: reportData,
            debug: {
                reportId: reportDef.id,
                aiParams: params
            }
        };

    } catch (error) {
        console.error("[AI-Controller] Error crítico:", error);
        return {
            type: 'ERROR',
            message: "Ocurrió un error interno al generar los datos del reporte."
        };
    }
}

