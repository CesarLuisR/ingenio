// src/types/reports.ts

export type AIResponse =
  | {
      type: "WIDGET";
      payload: ExecutiveReport; // <--- antes era ReportResponse
    }
  | {
      type: "TEXT";
      message: string;
    }
  | {
      type: "ERROR";
      message: string;
    };

// ---------------------------------------------------
// ESTRUCTURA DEL INFORME EJECUTIVO COMPLETO
// ---------------------------------------------------

export interface ExecutiveReport {
  title: string;
  description?: string;
  generatedAt: string;
  sections: ReportSection[];
}

export type ReportSection =
  | KPISection
  | ChartSection
  | TableSection
  | InsightSection;

// --- KPI SECTION ---
export interface KPISection {
  type: "KPI";
  metrics: {
    label: string;
    value: number | string;
    unit?: string;
  }[];

  title?: string;
}

// --- CHART SECTION ---
export interface ChartSection {
  type: "CHART";
  chartType: "LINE" | "BAR" | "PIE";
  data: any[];
  xKey: string;
  yKeys: string[];
  colors?: string[];

  title?: string;
}

// --- TABLE SECTION ---
export interface TableSection {
  type: "TABLE";
  columns: string[];
  rows: any[];

  title?: string;
}

// --- INSIGHT SECTION ---
export interface InsightSection {
  type: "INSIGHT";
  text: string;

  title?: string;
}
