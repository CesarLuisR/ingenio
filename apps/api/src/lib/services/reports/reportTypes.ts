// src/lib/services/reports/reportTypes.ts

export type TimeRange = {
  hours?: number;
  days?: number;
};

export type AggregationType = "sum" | "avg" | "count";

export type AggregationsMap = Record<string, AggregationType>;

export type JoinSpec = {
  model: string;      // modelo Prisma
  select: string[];   // campos básicos como ["name"]
};

export type FormatterSpec = {
  label?: Record<string, string>;
};

export type SectionVisualizationType =
  | "PIE_CHART"
  | "BAR_CHART"
  | "LINE_CHART"
  | "TABLE"
  | "KPI"
  | "TEXT_AI";

// Sección que consulta datos (gráficos / tablas / KPIs)
export interface DataSectionJSON {
  title: string;
  type: Exclude<SectionVisualizationType, "TEXT_AI">; // PIE/BAR/LINE/TABLE/KPI

  model: string;                // Prisma model: "machine", "maintenance", etc.
  groupBy: string;              // campo para agrupar
  aggregations: AggregationsMap;

  timestampField?: string;
  timeRange?: TimeRange;
  filterByIngenio?: boolean;

  join?: Record<string, JoinSpec>;
  colors?: Record<string, string>;
  formatters?: FormatterSpec;

  // Para tablas
  columns?: string[];           // campos a mostrar: ["label", "id", "oee", ...]
  units?: string;
}

// Sección solo de texto generado por IA
export interface TextAISectionJSON {
  title: string;
  type: "TEXT_AI";
  prompt: string;
}

export type SectionJSON = DataSectionJSON | TextAISectionJSON;

// Definición de un reporte en JSON
export type ReportDefinitionJSON = {
  name: string;
  description: string;
  requiredRoles: string[];

  sections: SectionJSON[];
};
