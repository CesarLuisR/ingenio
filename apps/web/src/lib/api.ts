const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

// Tipos
export interface Sensor {
  id: string
  sensorId: string;
  name: string
  type: string
  location: string
  status: "active" | "inactive" | "maintenance"
  lastReading?: string
  createdAt: string
  updatedAt: string
}

export interface Maintenance {
  id: string
  sensorId: string
  description: string
  scheduledDate: string
  completedDate?: string
  status: "pending" | "in_progress" | "completed"
  technician?: string
  notes?: string
  createdAt: string
}

export interface Failure {
  id: string
  sensorId: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  detectedAt: string
  resolvedAt?: string
  status: "open" | "in_progress" | "resolved"
  notes?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "technician" | "viewer"
  createdAt: string
}

export interface MetricAnalysis {
  tendencia: "subiendo" | "bajando" | "estable"
  pendiente: number
  valorActual: number
  rango: { min?: number; max?: number }
  urgencia: "normal" | "moderada" | "⚠️ muy alta" | "🚨 fuera de rango"
}

export interface ChartPoint {
  timestamp: string
  value: number
}

export interface ChartMetric {
  metric: string
  data: ChartPoint[]
}

export interface ChartData {
  [category: string]: ChartMetric[]
}

export interface CategorySummary {
  [metricName: string]: MetricAnalysis | { message: string }
}

export interface SensorReport {
  sensorId: string
  resumen: Record<string, CategorySummary>
  chartData: ChartData
}

export interface AnalysisResponse {
  timestamp: string
  report: SensorReport[]
}

// API Client
class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // Sensores
  async getSensors(): Promise<Sensor[]> {
    return this.request<Sensor[]>("/sensors")
  }

  async getSensor(id: string): Promise<Sensor> {
    return this.request<Sensor>(`/sensors/${id}`)
  }

  async createSensor(data: Partial<Sensor>): Promise<Sensor> {
    return this.request<Sensor>("/sensors", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateSensor(id: string, data: Partial<Sensor>): Promise<Sensor> {
    return this.request<Sensor>(`/sensors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteSensor(id: string): Promise<void> {
    return this.request<void>(`/sensors/${id}`, {
      method: "DELETE",
    })
  }

  // Mantenimientos
  async getMaintenances(): Promise<Maintenance[]> {
    return this.request<Maintenance[]>("/maintenances")
  }

  async createMaintenance(data: Partial<Maintenance>): Promise<Maintenance> {
    return this.request<Maintenance>("/maintenances", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Fallos
  async getFailures(): Promise<Failure[]> {
    return this.request<Failure[]>("/failures")
  }

  async createFailure(data: Partial<Failure>): Promise<Failure> {
    return this.request<Failure>("/failures", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Usuarios
  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/users")
  }

  async createUser(data: Partial<User>): Promise<User> {
    return this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Análisis
  async analyzeData(sensorIds: string[]): Promise<AnalysisResponse> {
    return this.request<AnalysisResponse>("/analyze", {
      method: "POST",
      body: JSON.stringify(sensorIds),
    })
  }

  // Ingestión
  async ingestData(data: any): Promise<void> {
    return this.request<void>("/ingest", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async ingestSensorData(data: any): Promise<void> {
    return this.request<void>("/ingest/sensor", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiClient()
