// src/lib/services/reports/executiveReportEngine.ts
import { PrismaClient } from "@prisma/client";
import definitions from "./definitions.json";
import {
    ReportDefinitionJSON,
    SectionJSON,
    DataSectionJSON,
    AggregationType
} from "./reportTypes";

const prisma = new PrismaClient();

// Cargamos el JSON tipado
const defs: Record<string, ReportDefinitionJSON> = definitions as any;

const AGG_MAP = {
    sum: "_sum",
    avg: "_avg",
    count: "_count"
} as const;

type PrismaAggKey = keyof typeof AGG_MAP;

// --- Tipo de salida que consumirá el frontend ---
export interface ExecutiveReportDTO {
    title: string;
    description?: string;
    generatedAt: Date;
    sections: Array<
        | {
            type: "CHART";
            title: string;
            chartType: "PIE" | "BAR" | "LINE";
            data: any[];
            xKey: string;
            yKeys: string[];
            units?: string;
            colors?: string[];
        }
        | {
            type: "TABLE";
            title: string;
            columns: string[];
            rows: any[];
        }
        | {
            type: "INSIGHT";
            title: string;
            text: string;
        }
    >;
}

// Util para saber si la sección es de datos
function isDataSection(section: SectionJSON): section is DataSectionJSON {
    return section.type !== "TEXT_AI";
}

// Ejecuta 1 sección de datos contra Prisma y la convierte en CHART o TABLE
async function runDataSection(
    section: DataSectionJSON,
    ctx: { ingenioId?: number }
) {
    // WHERE base
    const where: any = {};

    if (section.filterByIngenio && ctx.ingenioId) {
        where.ingenioId = ctx.ingenioId;
    }

    if (section.timestampField && section.timeRange) {
        const now = new Date();
        const since = new Date(now);

        if (section.timeRange.hours) {
            since.setHours(since.getHours() - section.timeRange.hours);
        }
        if (section.timeRange.days) {
            since.setDate(since.getDate() - section.timeRange.days);
        }

        where[section.timestampField] = { gte: since };
    }

    // MODELO PRISMA
    const prismaModel = (prisma as any)[section.model];
    if (!prismaModel) {
        throw new Error(`Modelo Prisma no encontrado: ${section.model}`);
    }

    // ---------------------------------------------------------
    // 🟦 CASO ESPECIAL: TABLA SIN AGREGACIONES (NO GROUP BY)
    // ---------------------------------------------------------
    if (!section.aggregations || !section.groupBy) {
        const raw = await prismaModel.findMany({
            where,
            select: undefined // deja que Prisma devuelva todo
        });

        return {
            kind: "TABLE" as const,
            title: section.title,
            columns: section.columns ?? Object.keys(raw[0] ?? {}),
            rows: raw
        };
    }

    // ---------------------------------------------------------
    // 🟩 CASO NORMAL: CHART + AGGREGATIONS + GROUP BY
    // ---------------------------------------------------------

    if (!prismaModel.groupBy) {
        throw new Error(`Modelo Prisma no soporta groupBy: ${section.model}`);
    }

    // Agregaciones dinámicas
    const prismaAgg: any = {};
    for (const field of Object.keys(section.aggregations)) {
        const method = section.aggregations[field] as AggregationType;
        const prismaKey = AGG_MAP[method];
        prismaAgg[prismaKey] = {
            ...(prismaAgg[prismaKey] || {}),
            [field]: true
        };
    }

    const rows = await prismaModel.groupBy({
        by: [section.groupBy],
        where,
        ...prismaAgg
    });

    const isPie = section.type === "PIE_CHART";
    const isTable = section.type === "TABLE";

    const data = await Promise.all(
        rows.map(async (row: any) => {
            let label: any = row[section.groupBy];

            // FORMATTERS opcionales
            if (section.formatters?.label?.[String(label)]) {
                label = section.formatters.label[String(label)];
            }

            // JOIN opcional
            // JOIN opcional y seguro ante nulls
            if (section.join?.[section.groupBy]) {
                const joinValue = row[section.groupBy];

                // Si el groupBy es null, usamos un label fallback y NO intentamos el join
                if (joinValue === null || joinValue === undefined) {
                    label = section.formatters?.label?.["null"] ?? "Sin asignar";
                } else {
                    const joinCfg = section.join[section.groupBy];
                    const joinModel = (prisma as any)[joinCfg.model];

                    const ref = await joinModel.findUnique({
                        where: { id: joinValue },
                        select: Object.fromEntries(joinCfg.select.map((f) => [f, true]))
                    });

                    if (ref?.name) label = ref.name;
                }
            }


            // Valor agregado
            let aggValue = null;
            if (row._avg) aggValue = Object.values(row._avg)[0];
            if (row._sum) aggValue = Object.values(row._sum)[0];
            if (row._count) aggValue = Object.values(row._count)[0];

            if (isPie) {
                return {
                    label,
                    value: aggValue,
                    fill: section.colors?.[String(row[section.groupBy])]
                };
            }

            const entry: any = { label };

            for (const metricName of Object.keys(section.aggregations)) {
                entry[metricName] = aggValue;
            }

            return entry;
        })
    );

    // TABLA con aggregations
    if (isTable) {
        const columns =
            section.columns && section.columns.length > 0
                ? section.columns
                : ["label", ...Object.keys(section.aggregations)];

        return {
            kind: "TABLE" as const,
            title: section.title,
            columns,
            rows: data
        };
    }

    // CHART
    const chartType: "PIE" | "BAR" | "LINE" =
        section.type === "LINE_CHART"
            ? "LINE"
            : section.type === "BAR_CHART"
                ? "BAR"
                : "PIE";

    const yKeys =
        chartType === "PIE" ? ["value"] : Object.keys(section.aggregations);

    return {
        kind: "CHART" as const,
        title: section.title,
        chartType,
        data,
        xKey: "label",
        yKeys,
        units: section.units,
        colors: section.colors ? Object.values(section.colors) : undefined
    };
}


// --- MOTOR PRINCIPAL ---

export async function runExecutiveReport(
    reportId: string,
    ctx: { ingenioId?: number },
    params: Record<string, any> = {}
): Promise<ExecutiveReportDTO> {
    const def = defs[reportId];
    if (!def) {
        throw new Error(`Reporte no registrado: ${reportId}`);
    }

    const sectionResults: ExecutiveReportDTO["sections"] = [];

    for (const section of def.sections) {
        // TEXT_AI: de momento stub (luego lo conectamos a Gemini)
        if (section.type === "TEXT_AI") {
            sectionResults.push({
                type: "INSIGHT",
                title: section.title,
                text:
                    "✍️ Análisis ejecutivo pendiente de generar por IA.\n\n" +
                    `Prompt sugerido:\n${section.prompt}`
            });
            continue;
        }

        // Sección de datos: CHART o TABLE
        const res = await runDataSection(section as DataSectionJSON, ctx);

        if (res.kind === "TABLE") {
            sectionResults.push({
                type: "TABLE",
                title: res.title,
                columns: res.columns,
                rows: res.rows
            });
        } else {
            sectionResults.push({
                type: "CHART",
                title: res.title,
                chartType: res.chartType,
                data: res.data,
                xKey: res.xKey,
                yKeys: res.yKeys,
                units: res.units,
                colors: res.colors
            });
        }
    }

    return {
        title: def.name,
        description: def.description,
        generatedAt: new Date(),
        sections: sectionResults
    };
}
