// services/reports/reportRegistry.ts
import definitions from "./definitions.json";
import { runReport } from "./reportEngine";
import { ReportDefinitionJSON } from "./reportTypes";
import { ReportDefinition } from "../../../types/reports";
import { UserRole } from "@prisma/client";

// Tipamos el JSON como un diccionario de definiciones declarativas
const defs: Record<string, ReportDefinitionJSON> = definitions as any;

// Aquí convertimos cada entrada JSON en un ReportDefinition real
export const REPORT_REGISTRY: Record<string, ReportDefinition> = Object.fromEntries(
    Object.entries(defs).map(([id, def]) => {
        const reportDef: ReportDefinition = {
            id,
            name: def.name,
            description: def.description,
            requiredRoles: def.requiredRoles as UserRole[],
            generator: (ctx, params) => runReport(id, ctx, params)
        };

        return [id, reportDef];
    })
);
