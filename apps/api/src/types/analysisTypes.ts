export interface MetricAnalysis {
    tendencia: "subiendo" | "bajando" | "estable";
    pendiente: number;
    valorActual: number;
    rango: { min?: number; max?: number };
    urgencia: "normal" | "moderada" | "⚠️ muy alta" | "🚨 fuera de rango";
}

export interface ChartPoint {
    timestamp: string;
    value: number;
}

export interface ChartMetric {
    metric: string;
    data: ChartPoint[];
}

export interface ChartData {
    [category: string]: ChartMetric[];
}

export interface CategorySummary {
    [metricName: string]: MetricAnalysis | { message: string };
}

export interface SensorReport {
    sensorId: string;
    resumen: Record<string, CategorySummary>;
    chartData: ChartData;
}

export interface AnalysisResponse {
    timestamp: string;
    report: SensorReport[];
}