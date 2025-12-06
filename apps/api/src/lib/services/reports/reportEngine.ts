import { PrismaClient } from "@prisma/client";
import definitions from "./definitions.json";
import { ReportDefinitionJSON } from "./reportTypes";
import { VisualizationType } from "../../../types/reports";

// Valida y convierte tipo de grafica
function mapToVisualizationType(type: string): VisualizationType {
    const allowed = ["PIE_CHART", "BAR_CHART", "LINE_CHART", "KPI"];
    if (!allowed.includes(type)) {
        throw new Error(`VisualizationType inválido: ${type}`);
    }
    return type as VisualizationType;
}

const prisma = new PrismaClient();

// JSON tipado como diccionario
const reportDefs: Record<string, ReportDefinitionJSON> = definitions as any;

const AGGREGATION_MAP = {
    sum: "_sum",
    avg: "_avg",
    count: "_count"
} as const;

type PrismaAggOp = keyof typeof AGGREGATION_MAP;

export async function runReport(
    reportId: string,
    ctx: { ingenioId?: number },
    params: Record<string, any> = {}
) {
    const def = reportDefs[reportId];
    if (!def) throw new Error(`Reporte no registrado: ${reportId}`);

    // ------------------------------
    // FILTRO BASE DE CONSULTA
    // ------------------------------
    const where: any = {};

    if (def.filterByIngenio && ctx.ingenioId) {
        where.ingenioId = ctx.ingenioId;
    }

    // FILTRO DE RANGO DE TIEMPO
    if (def.timeRange && def.timestampField) {
        const now = new Date();
        let since = new Date(now);

        if (def.timeRange.hours) since.setHours(since.getHours() - def.timeRange.hours);
        if (def.timeRange.days) since.setDate(since.getDate() - def.timeRange.days);

        where[def.timestampField] = { gte: since };
    }

    // ------------------------------
    // PREPARAR AGREGACIONES DINÁMICAS
    // ------------------------------
    const prismaAggregations: any = {};

    for (const field in def.aggregations) {
        const method = def.aggregations[field] as PrismaAggOp;
        const prismaKey = AGGREGATION_MAP[method];

        prismaAggregations[prismaKey] = {
            ...(prismaAggregations[prismaKey] || {}),
            [field]: true
        };
    }

    // ------------------------------
    // EJECUTAR GROUP BY DINÁMICO
    // ------------------------------
    const prismaModel = (prisma as any)[def.model];
    if (!prismaModel?.groupBy) {
        throw new Error(`Modelo Prisma inválido: ${def.model}`);
    }

    const rows = await prismaModel.groupBy({
        by: [def.groupBy],
        where,
        ...prismaAggregations
    });

    // ------------------------------
    // PROCESAR FILAS A FORMATO DE REPORTES
    // ------------------------------
    const isPieChart = def.type === "PIE_CHART";

    const processedData = await Promise.all(
        rows.map(async (row: any) => {
            let label = row[def.groupBy];

            // Formatters (e.g. true → “Operativas”)
            if (def.formatters?.name?.[String(label)]) {
                label = def.formatters.name[String(label)];
            }

            // JOIN dinámico
            if (def.join?.[def.groupBy]) {
                const joinCfg = def.join[def.groupBy];
                const joinModel = (prisma as any)[joinCfg.model];

                const ref = await joinModel.findUnique({
                    where: { id: row[def.groupBy] },
                    select: Object.fromEntries(joinCfg.select.map(f => [f, true]))
                });

                if (ref?.name) label = ref.name;
            }

            // Extraer valor del agregador
            let aggValue = null;
            if (row._avg) aggValue = Object.values(row._avg)[0];
            if (row._sum) aggValue = Object.values(row._sum)[0];
            if (row._count) aggValue = Object.values(row._count)[0];

            // ----------------------------
            // FORMATO FINAL SEGÚN TIPO DE GRÁFICO
            // ----------------------------

            // 🎯 PIE → { label, value, fill }
            if (isPieChart) {
                return {
                    label,
                    value: aggValue,
                    fill: def.colors?.[String(row[def.groupBy])]
                };
            }

            // 🎯 BAR / LINE → claves dinámicas
            const entry: any = {
                label
            };

            for (const metricName of Object.keys(def.aggregations)) {
                entry[metricName] = aggValue;
            }

            return entry;
        })
    );

    // ------------------------------
    // RESPUESTA FINAL NORMALIZADA
    // ------------------------------
    return {
        meta: {
            title: def.name,
            description: def.description,
            type: mapToVisualizationType(def.type),
            units: def.units || "",

            // Más expresivo y consistente
            xKey: isPieChart ? "label" : def.groupBy,
            yKeys: isPieChart ? ["value"] : Object.keys(def.aggregations),

            colors: def.colors ? Object.values(def.colors) : undefined
        },
        data: processedData,
        generatedAt: new Date()
    };
}
