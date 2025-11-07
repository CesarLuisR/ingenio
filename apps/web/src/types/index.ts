export interface Sensor {
	id: number;
	sensorId: string;
	name: string;
	type: string;
	location?: string;
	active: boolean;
	config: Record<string, any>;
	lastSeen?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Maintenance {
	id: number;
	sensorId: number; // foreign key (numeric, matches backend)
	performedAt: string;
	notes?: string;
}

export interface Failure {
	id: number;
	sensorId: number; // foreign key (numeric)
	occurredAt: string;
	description: string;
}

export interface User {
	id: number;
	email: string;
	name: string;
	role: "admin" | "technician" | "viewer";
	createdAt: string;
}

// Metrics + analysis (frontend-only logic)
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

// Live reading models
export interface MetricInfo {
	value: number;
	status: "ok" | "low" | "high" | "critical" | "unknown";
}

export interface MetricsGroup {
	[metricName: string]: MetricInfo | number | undefined;
}

export interface MetricsMap {
	[category: string]: MetricsGroup;
}

export interface Reading {
	sensorId: string;
	timestamp: string;
	status: "ok" | "warning" | "critical" | "unknown";
	issues: any[];
	metrics: MetricsMap;
	totalIssues: number;
	severityLevel: number;
}