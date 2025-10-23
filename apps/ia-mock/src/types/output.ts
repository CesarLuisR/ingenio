interface MetricAnalysis {
    tendencia: "subiendo" | "bajando" | "estable";
    pendiente: number;
    valorActual: number;
    rango: { min?: number; max?: number };
    urgencia: "normal" | "moderada" | "⚠️ muy alta" | "🚨 fuera de rango";
}

interface ChartPoint {
    timestamp: string;
    value: number;
}

interface ChartMetric {
    metric: string;
    data: ChartPoint[];
}

interface ChartData {
    [category: string]: ChartMetric[];
}

interface CategorySummary {
    [metricName: string]: MetricAnalysis | { message: string };
}

interface SensorReport {
    sensorId: string;
    resumen: Record<string, CategorySummary>;
    chartData: ChartData;
}