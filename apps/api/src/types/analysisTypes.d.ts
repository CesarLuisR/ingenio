export interface CategorySummary {
    [metricName: string]: MetricAnalysis | { message: string };
}

export interface AnalysisResponse {
    timestamp: string;
    report: SensorReport[];
}

////

export interface ChartPoint {
    timestamp: string;
    value: number;
    confidenceLow?: number;
    confidenceHigh?: number;
    isFuture?: boolean;
}

export interface ChartMetric {
    metric: string;
    data: ChartPoint[];
}

export interface MetricAnalysis {
    status: "ok" | "warning" | "critical";
    valorActual: number;
    predictedValue24h: number;
    pendiente: number;
    volatility: number;
    tendencia: "subiendo" | "bajando" | "estable";
    urgencia: "normal" | "moderada" | "⚠️ muy alta" | "🚨 fuera de rango";
    recommendation: string;
    message: string;
    rulHours: number | null;
    anomalyCount: number;
    rango: {
        min: number | null;
        max: number | null;
    };
}

export interface SensorReport {
    sensorId: string;
    resumen: Record<string, Record<string, MetricAnalysis>>;
    chartData: Record<string, ChartMetric[]>;
}

export interface AnalysisResponse {
    timestamp: string;
    report: SensorReport[];
}