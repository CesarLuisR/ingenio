export type TimeRange = {
  hours?: number;
  days?: number;
};

export type AggregationType = "sum" | "avg" | "count";

export type AggregationsMap = Record<string, AggregationType>;

export type JoinSpec = {
  model: string;           // modelo Prisma
  select: string[];        // campos a traer (solo name, id, etc.)
};

export type ReportDefinitionJSON = {
  name: string;
  description: string;
  model: string;                    // debe existir en prisma
  type: string;                     // PIE_CHART, BAR_CHART, etc.
  units?: string;
  groupBy: string;
  aggregations: AggregationsMap;
  timestampField?: string;
  timeRange?: TimeRange;
  filterByIngenio?: boolean;
  join?: Record<string, JoinSpec>;
  colors?: Record<string, string>;
  formatters?: {
    name?: Record<string, string>;
  };
  requiredRoles: string[];
};