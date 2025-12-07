// ==========================================
// 🌐 DOMINIO PRINCIPAL (DATABASE MODELS)
// ==========================================

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

    machineId: number;
    ingenioId: number;

    machine?: Machine | null;
    maintenances?: Maintenance[];
    failures?: Failure[];
}

// --- ConfigData ---
export interface ConfigData {
    sensorId: string;
    name: string;
    type: string;
    location?: string | null;
    active: boolean;
    config: Record<string, any>;
    lastSeen?: string | null;
    createdAt: string;
    updatedAt: string;
    machineId: number;
    ingenioId: number;
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

    lastAnalyzedAt?: string | null;
    lastAnalysis?: any | null;

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
    type: 'Preventivo' | 'Correctivo' | 'Predictivo';
    technicianId?: number | null;
    durationMinutes?: number | null;
    notes?: string | null;
    cost?: number | null;

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
    active: boolean;
    createdAt: string;
    updatedAt: string;
    machines?: Machine[];
    sensors?: Sensor[];
    maintenances?: Maintenance[];
    failures?: Failure[];
}

// ==========================================
// 🧠 ANÁLISIS PREDICTIVO & IA (NEW)
// ==========================================

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
    
    // Claves estandarizadas en Inglés
    currentValue: number;     
    predictedValue24h: number; 
    slope: number;            
    volatility: number;
    trend: "increasing" | "decreasing" | "stable";
    
    recommendation: string;
    message?: string; // Opcional, legacy
    rulHours: number | null;
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

export interface MachineAnalysisResponse {
    machine: { id: number; name: string; code: string };
    analysis: AnalysisResponse;
}

// ==========================================
// 📡 LECTURAS EN TIEMPO REAL (SOCKETS)
// ==========================================

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

// ==========================================
// 📊 DASHBOARD & KPIs
// ==========================================

export interface BaseMetrics {
    availability: number | null;
    reliability: number | null;
    mtbf: number | null;
    mttr: number | null;
    mtta: number | null;
}

export interface SensorHealth {
    active: boolean;
    lastSeen: string | null;
    lastAnalysis: any | null;
}

// ==========================================
// 🔐 CONSTANTES
// ==========================================

export const ROLES = {
    SUPERADMIN: "SUPERADMIN",
    ADMIN: "ADMIN",
    TECNICO: "TECNICO",
    LECTOR: "LECTOR",
} as const;

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        totalItems: number;
        currentPage: number;
        totalPages: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface AuditLog {
  id: string; // String porque viene serializado del BigInt
  action: string;
  entity: string;
  entityId?: number;
  userId: number;
  ingenioId: number;
  ip: string;
  meta: any; // El JSON con el "antes"
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}