// --- Sensor ---
export interface Sensor {
	id: number;
	sensorId: string;
	name: string;
	type: string;
	location?: string | null;
	active: boolean;
	config: Record<string, any>;
	lastSeen?: string | null;
	createdAt: string;
	updatedAt: string;

	// nuevo modelo
	machineId: number;
	ingenioId: number;

	machine?: Machine | null;
	maintenances?: Maintenance[];
	failures?: Failure[];
}

// --- Machine ---
export interface Machine {
	id: number;
	name: string;
	code: string;
	type?: string | null;
	description?: string | null;
	location?: string | null;
	active: boolean;
	createdAt: string;
	updatedAt: string;

	ingenioId: number;
	ingenio?: Ingenio;

	sensors?: Sensor[];
	maintenances?: Maintenance[];
	failures?: Failure[];
}

// --- Maintenance ---
export interface Maintenance {
	id: number;
	performedAt: string; // ISO
	type: 'Preventivo' | 'Correctivo' | 'Predictivo';        // "Preventivo" | "Correctivo" | etc.
	technicianId?: number | null;
	durationMinutes?: number | null;
	notes?: string | null;
	cost?: number | null;

	// modelo nuevo
	machineId: number;
	ingenioId: number;

	machine?: Machine;
	technician?: Technician;
	failures?: Failure[];
}

// --- Failure ---
export interface Failure {
	id: number;
	occurredAt: string; // ISO
	description: string;
	severity?: string | null; // "Alta" | "Media" | "Baja"
	status?: string | null;   // "pendiente" | "en reparación" | "resuelta"
	resolvedAt?: string | null;
	maintenanceId?: number | null;

	// relaciones
	machineId: number;
	ingenioId: number;
	sensorId?: number | null;

	machine?: Machine;
	sensor?: Sensor;
	maintenance?: Maintenance;
}

// --- User ---
export interface User {
	id: number;
	email: string;
	name: string;
	role: "SUPERADMIN" | "ADMIN" | "TECNICO" | "LECTOR";
	createdAt: string;

	ingenioId: number;
	ingenio?: Ingenio;
}

// --- Technician ---
export interface Technician {
	id: number;
	name: string;
	email?: string | null;
	phone?: string | null;
	active: boolean;

	ingenioId: number;
	ingenio?: Ingenio;

	maintenances?: Maintenance[];
}

// --- Ingenio ---
export interface Ingenio {
	id: number;
	name: string;
	code: string;
	location?: string | null;
	createdAt: string;
	updatedAt: string;

	machines?: Machine[];
	sensors?: Sensor[];
	maintenances?: Maintenance[];
	failures?: Failure[];
}

// ---------------- Metrics & Analysis (frontend) ----------------

export interface BaseMetrics {
	availability: number | null;
	reliability: number | null;
	mtbf: number | null;
	mttr: number | null;
	mtta: number | null;
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

export interface AnalysisResponse {
	timestamp: string;
	report: SensorReport[];
}

// ------------- Live reading models -------------

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

// ROLES (alineado al enum de Prisma)
export const ROLES = {
	SUPERADMIN: "SUPERADMIN",
	ADMIN: "ADMIN",
	TECNICO: "TECNICO",
	LECTOR: "LECTOR",
} as const;

export interface SensorHealth {
	active: boolean;
	lastSeen: string | null;
	lastAnalysis: any | null;
}

// NEW TYPES

export interface ChartPoint {
    timestamp: string;
    value: number;
}

export interface ChartMetric {
    metric: string;
    data: ChartPoint[];
}

export interface MetricAnalysis {
    tendencia: "subiendo" | "bajando" | "estable";
    pendiente: number;
    valorActual: number;
    rango: {
        min: number;
        max: number;
    };
    urgencia: "normal" | "moderada" | "⚠️ muy alta" | "🚨 fuera de rango";
    message?: string; // Opcional, ya que en tu JSON a veces no viene
}

export interface SensorReport {
    sensorId: string;
    // Resumen: Objeto anidado por categoría -> métrica -> análisis
    resumen: Record<string, Record<string, MetricAnalysis>>;
    // ChartData: Objeto anidado por categoría -> array de gráficos
    chartData: Record<string, ChartMetric[]>;
}

export interface AnalysisResponse {
    timestamp: string;
    report: SensorReport[];
}

// Tipo envoltorio que devuelve tu endpoint analyzeMachine
export interface MachineAnalysisResponse {
    machine: {
        id: number;
        name: string;
        code: string;
    };
    analysis: AnalysisResponse;
}