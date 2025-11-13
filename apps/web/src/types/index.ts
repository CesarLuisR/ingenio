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
  sensorId: number;
  performedAt: string; // DateTime → string ISO
  type: string; // "Preventivo" | "Correctivo" | "Predictivo"
  technicianId?: number | null;
  durationMinutes?: number | null;
  notes?: string | null;
  cost?: number | null;

  // Relaciones opcionales
  sensor?: Sensor;
  technician?: Technician;
  failures?: Failure[];
}

// --- Failure ---
export interface Failure {
  id: number;
  sensorId: number;
  occurredAt: string; // DateTime → string ISO
  description: string;
  severity?: string | null; // "Alta" | "Media" | "Baja"
  status?: string | null; // "pendiente" | "en reparación" | "resuelta"
  resolvedAt?: string | null;
  maintenanceId?: number | null;

  // Relaciones opcionales
  sensor?: Sensor;
  maintenance?: Maintenance;
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

export interface Technician {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  active: boolean;
  maintenances?: Maintenance[]; // relación opcional
}
