import { UserRole } from '@prisma/client';

/* -------------------------------------------------------
   NUEVO MODELO DE INFORMES EJECUTIVOS (🔥 CLAVE DEL SISTEMA)
---------------------------------------------------------*/

export interface ExecutiveReport {
  title: string;
  description?: string;
  generatedAt: string; // ISO string para PDF y exportación
  sections: ReportSection[]; // Cada bloque visible del informe
}

/* -------------------------------------------------------
   TIPOS DE SECCIONES QUE PUEDE CONTENER UN INFORME
---------------------------------------------------------*/

export type ReportSection =
  | KPISection
  | ChartSection
  | TableSection
  | InsightSection;

/* ------------------- KPI SECTION ---------------------- */

export interface KPISection {
  type: "KPI";
  metrics: {
    label: string;
    value: number | string;
    unit?: string;
  }[];
}

/* ------------------- CHART SECTION -------------------- */

export interface ChartSection {
  type: "CHART";
  chartType: "LINE" | "BAR" | "PIE";
  data: any[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
}

/* ------------------- TABLE SECTION -------------------- */

export interface TableSection {
  type: "TABLE";
  columns: string[];
  rows: any[];
}

/* ------------------- INSIGHT SECTION ------------------ */

export interface InsightSection {
  type: "INSIGHT";
  text: string; // generada por IA o algoritmo interno
}

/* -------------------------------------------------------
   CONTEXTO, PARAMETROS Y DEFINICIÓN DE CADA REPORTE
---------------------------------------------------------*/

export interface ReportContext {
  userId: number;
  userRole: UserRole;
  ingenioId?: number;
}

export interface ReportParams {
  startDate?: Date;
  endDate?: Date;
  machineId?: number;
  [key: string]: any;
}

// Lo que tu sistema “ve”
export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  requiredRoles: UserRole[];
  generator: (
    ctx: ReportContext,
    params: ReportParams
  ) => Promise<ExecutiveReport>;
}
