// src/lib/services/reports/reportRegistry.ts
import definitions from "./definitions.json";
import { runExecutiveReport } from "./reportEngine";
import { ReportDefinitionJSON } from "./reportTypes";
import { ReportDefinition } from "../../../types/reports";
import { UserRole } from "@prisma/client";

// Tipamos el JSON como un diccionario de definiciones declarativas
const defs: Record<string, ReportDefinitionJSON> = definitions as any;

// Convertimos cada entrada JSON en un ReportDefinition real
export const REPORT_REGISTRY: Record<string, ReportDefinition> = Object.fromEntries(
  Object.entries(defs).map(([id, def]) => {
    const reportDef: ReportDefinition = {
      id,
      name: def.name,
      description: def.description,
      requiredRoles: def.requiredRoles as UserRole[],
      // Aquí “engañamos” un poco al tipo: el generador en realidad devuelve un ExecutiveReportDTO
      generator: (ctx, params) => runExecutiveReport(id, ctx, params) as any
    };

    return [id, reportDef];
  })
);
