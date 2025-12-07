import type {
    AnalysisResponse,
    BaseMetrics,
    Failure,
    Ingenio,
    Maintenance,
    Reading,
    Sensor,
    Technician,
    User,
    Machine,
    PaginatedResponse,
    AuditLog,
} from "../types";
import type { AIResponse, ExecutiveReport } from "../types/reports";

const API_BASE_URL =
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";
console.log("LA API MIRALA AQUI: ", API_BASE_URL);

// --- CLIENTE BASE ---

class BaseApiClient {
    protected async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            credentials: "include",
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error ${response.status}: ${errText}`);
        }

        if (response.status === 204) return undefined as T;

        return response.json();
    }

    protected buildQuery(params?: Record<string, any>): string {
        if (!params) return "";

        const query = new URLSearchParams();

        const appendParam = (key: string, value: any) => {
            if (value === undefined || value === null || value === "") return;

            if (Array.isArray(value)) {
                value.forEach(v => appendParam(key, v));
            }
            else if (typeof value === "object") {
                Object.entries(value).forEach(([subKey, subVal]) => {
                    appendParam(`${key}.${subKey}`, subVal);
                });
            }
            else {
                query.append(key, String(value));
            }
        };

        Object.entries(params).forEach(([key, value]) => appendParam(key, value));

        const queryString = query.toString();
        return queryString ? `?${queryString}` : "";
    }
}

// --- SERVICIOS MODULARES ---

class AuthService extends BaseApiClient {
    async login(email: string, password: string): Promise<User> {
        const data = await this.request<{ user: User }>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        return data.user;
    }

    async logout(): Promise<void> {
        return this.request<void>("/api/auth/logout", { method: "POST" });
    }

    async getSession(): Promise<User | null> {
        try {
            const data = await this.request<{ user: User | null }>("/api/auth/session");
            return data.user ?? null;
        } catch {
            return null;
        }
    }
}

class DashboardService extends BaseApiClient {
    getHistory(ingenioId: number): Promise<{ time: string; availability: number; failures: number }[]> {
        return this.request(`/api/dashboard/${ingenioId}/history`);
    }

    getRecentActivity(ingenioId: number): Promise<Array<{
        id: string;
        type: 'failure' | 'maintenance';
        title: string;
        machine: string;
        status: string;
        timestamp: string;
        meta: string;
    }>> {
        return this.request(`/api/dashboard/${ingenioId}/activity`);
    }
}

class IngenioService extends BaseApiClient {
    getAll(params: Record<string, any> = {}): Promise<PaginatedResponse<Ingenio>> {
        const query = this.buildQuery(params);
        return this.request<PaginatedResponse<Ingenio>>(`/api/ingenios${query}`);
    }

    getList(): Promise<Ingenio[]> {
        return this.request<Ingenio[]>('/api/ingenios?simple=true');
    }

    getOne(id: number): Promise<Ingenio> {
        return this.request<Ingenio>(`/api/ingenios/${id}`);
    }

    create(data: Partial<Ingenio>): Promise<Ingenio> {
        return this.request<Ingenio>("/api/ingenios", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    update(id: number, data: Partial<Ingenio>): Promise<Ingenio> {
        return this.request<Ingenio>(`/api/ingenios/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    delete(id: number): Promise<void> {
        return this.request<void>(`/api/ingenios/${id}`, { method: "DELETE" });
    }

    activate(id: number): Promise<void> {
        return this.request<void>(`/api/ingenios/${id}/activate`, { method: "PUT" });
    }

    deactivate(id: number): Promise<void> {
        return this.request<void>(`/api/ingenios/${id}/deactivate`, { method: "PUT" });
    }
}

class MachineService extends BaseApiClient {
    getAll(params: Record<string, any> = {}): Promise<PaginatedResponse<Machine>> {
        const query = this.buildQuery(params);
        return this.request<PaginatedResponse<Machine>>(`/api/machines${query}`);
    }

    getList(params: Record<string, any> = {}): Promise<Machine[]> {
        const queryParams = { ...params, simple: true };
        const query = this.buildQuery(queryParams);
        return this.request<Machine[]>(`/api/machines${query}`);
    }

    getOne(id: number): Promise<Machine> {
        return this.request<Machine>(`/api/machines/${id}`);
    }

    create(data: Partial<Machine>): Promise<Machine> {
        return this.request<Machine>("/api/machines", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    update(id: number, data: Partial<Machine>): Promise<Machine> {
        return this.request<Machine>(`/api/machines/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    delete(id: number): Promise<void> {
        return this.request<void>(`/api/machines/${id}`, { method: "DELETE" });
    }
}

class SensorService extends BaseApiClient {
    // Paginated
    getAll(params: Record<string, any> = {}): Promise<PaginatedResponse<Sensor>> {
        const query = this.buildQuery(params);
        return this.request<PaginatedResponse<Sensor>>(`/api/sensors${query}`);
    }

    // Simple list (sin paginación, lightweight)
    getList(params: Record<string, any> = {}): Promise<Sensor[]> {
        const queryParams = { ...params, simple: true };
        const query = this.buildQuery(queryParams);
        return this.request<Sensor[]>(`/api/sensors${query}`);
    }

    getOne(id: number): Promise<Sensor> {
        return this.request<Sensor>(`/api/sensors/${id}`);
    }

    create(data: { sensorId: string; machineId: number; ingenioId: number }): Promise<Sensor> {
        return this.request<Sensor>(`/api/sensors`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    update(id: number, data: Partial<Sensor>): Promise<Sensor> {
        return this.request<Sensor>(`/api/sensors/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    activate(id: number): Promise<Sensor> {
        return this.request<Sensor>(`/api/sensors/${id}/activate`, { method: "PATCH" });
    }

    deactivate(id: number): Promise<Sensor> {
        return this.request<Sensor>(`/api/sensors/${id}/deactivate`, { method: "PATCH" });
    }

    getReadings(sensorId: string): Promise<Reading[]> {
        return this.request<Reading[]>(`/api/sensors/${sensorId}/readings`);
    }
}

class MaintenanceService extends BaseApiClient {
    getAll(params: Record<string, any> = {}): Promise<PaginatedResponse<Maintenance>> {
        const query = this.buildQuery(params);
        return this.request<PaginatedResponse<Maintenance>>(`/api/maintenances${query}`);
    }

    getOne(id: string): Promise<Maintenance> {
        return this.request<Maintenance>(`/api/maintenances/${id}`);
    }

    create(data: Partial<Maintenance>): Promise<Maintenance> {
        return this.request<Maintenance>("/api/maintenances", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    update(id: string, data: Partial<Maintenance>): Promise<Maintenance> {
        return this.request<Maintenance>(`/api/maintenances/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    delete(id: string): Promise<void> {
        return this.request<void>(`/api/maintenances/${id}`, { method: "DELETE" });
    }
}

class FailureService extends BaseApiClient {
    getAll(params: Record<string, any> = {}): Promise<PaginatedResponse<Failure>> {
        const query = this.buildQuery(params);
        return this.request<PaginatedResponse<Failure>>(`/api/failures${query}`);
    }

    // Simple list (sin paginación, lightweight)
    getList(params: Record<string, any> = {}): Promise<Failure[]> {
        const queryParams = { ...params, simple: true };
        const query = this.buildQuery(queryParams);
        return this.request<Failure[]>(`/api/failures${query}`);
    }

    getOne(id: string): Promise<Failure> {
        return this.request<Failure>(`/api/failures/${id}`);
    }

    create(data: Partial<Failure>): Promise<Failure> {
        return this.request<Failure>("/api/failures", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    update(id: string, data: Partial<Failure>): Promise<Failure> {
        return this.request<Failure>(`/api/failures/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    delete(id: string): Promise<void> {
        return this.request<void>(`/api/failures/${id}`, { method: "DELETE" });
    }
}

class TechnicianService extends BaseApiClient {
    getAll(params: Record<string, any> = {}): Promise<PaginatedResponse<Technician>> {
        const query = this.buildQuery(params);
        return this.request<PaginatedResponse<Technician>>(`/api/technicians${query}`);
    }

    // Simple list (sin paginación, lightweight)
    getList(params: Record<string, any> = {}): Promise<Technician[]> {
        const queryParams = { ...params, simple: true };
        const query = this.buildQuery(queryParams);
        return this.request<Technician[]>(`/api/technicians${query}`);
    }

    getOne(id: string): Promise<Technician> {
        return this.request<Technician>(`/api/technicians/${id}`);
    }

    create(data: Partial<Technician>): Promise<Technician> {
        return this.request<Technician>("/api/technicians", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    update(id: string, data: Partial<Technician>): Promise<Technician> {
        return this.request<Technician>(`/api/technicians/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    delete(id: string): Promise<void> {
        return this.request<void>(`/api/technicians/${id}`, { method: "DELETE" });
    }
}

class UserService extends BaseApiClient {
    getAll(params: Record<string, any> = {}): Promise<PaginatedResponse<User>> {
        const query = this.buildQuery(params);
        return this.request<PaginatedResponse<User>>(`/api/users${query}`);
    }

    // Simple list (sin paginación, lightweight)
    getList(params: Record<string, any> = {}): Promise<User[]> {
        const queryParams = { ...params, simple: true };
        const query = this.buildQuery(queryParams);
        return this.request<User[]>(`/api/failure${query}`);
    }

    create(data: Partial<User>): Promise<User> {
        return this.request<User>("/api/users", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    update(id: string, data: Partial<User>): Promise<User> {
        return this.request<User>(`/api/users/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    delete(id: string): Promise<void> {
        return this.request<void>(`/api/users/${id}`, { method: "DELETE" });
    }

    changePassword(password: string): void {
        this.request<void>(`/api/users/change-password`, {
            method: "POST",
            body: JSON.stringify({ password }),
        });
    }
}

class MetricsService extends BaseApiClient {
    getMachineMetrics(machineId: number): Promise<BaseMetrics> {
        return this.request<BaseMetrics>(`/api/metrics/machine/${machineId}`);
    }

    getIngenioMetrics(ingenioId: number): Promise<BaseMetrics> {
        return this.request<BaseMetrics>(`/api/metrics/ingenio/${ingenioId}`);
    }

    getSensorHealth(id: number): Promise<{
        active: boolean;
        lastSeen: string | null;
        lastAnalysis: any | null;
    }> {
        return this.request(`/api/metrics/sensor/${id}/health`);
    }

    analyzeMachine(machineId: number): Promise<{ machine: any; analysis: AnalysisResponse }> {
        return this.request(`/api/analyze/machine/${machineId}`, { method: "GET" });
    }
}

class IngestService extends BaseApiClient {
    ingestData(data: any): Promise<void> {
        return this.request<void>("/api/ingest", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    ingestSensorData(data: any): Promise<void> {
        return this.request<void>("/api/ingest/sensor", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
}

class ReportService extends BaseApiClient {
    
    /**
     * Envía una pregunta en lenguaje natural a la IA (Gemini).
     * La IA decidirá qué reporte devolver o si responder con texto.
     * * @param query La pregunta del usuario (ej: "¿Cuántas fallas hubo ayer?")
     */
    async askAssistant(query: string): Promise<AIResponse> {
        return this.request<AIResponse>('/api/reports', {
            method: 'POST',
            body: JSON.stringify({ query }),
        });
    }

    /**
     * Obtiene un reporte específico directamente por su ID, saltándose la IA.
     * Útil para cargar dashboards predefinidos o widgets fijos.
     * * @param reportId El ID del reporte (ej: 'GLOBAL_OEE')
     * @param params Filtros opcionales (fechas, ids, etc.)
     */
    async getReportDirectly(reportId: string, params?: Record<string, any>): Promise<ExecutiveReport> {
        // Usamos tu método buildQuery para convertir el objeto a query string
        // Ej: /reports/GLOBAL_OEE?startDate=2023-10-01&active=true
        const queryString = this.buildQuery(params);
        
        return this.request<ExecutiveReport>(`/reports/${reportId}${queryString}`, {
            method: 'GET'
        });
    }
}

class AuditLogService extends BaseApiClient {
    /**
     * Obtiene los logs con filtros y paginación.
     * Params útiles: page, limit, userId, action, entity, startDate, endDate
     */
    getAll(params: Record<string, any> = {}): Promise<PaginatedResponse<AuditLog>> {
        const query = this.buildQuery(params);
        return this.request<PaginatedResponse<AuditLog>>(`/api/logs${query}`);
    }

    /**
     * Obtiene el detalle de un log específico (incluyendo el meta completo)
     */
    getOne(id: string): Promise<AuditLog> {
        return this.request<AuditLog>(`/api/logs/${id}`);
    }
}

// --- API FAÇADE ---

const auth = new AuthService();
const dashboard = new DashboardService();
const ingenios = new IngenioService();
const machines = new MachineService();
const sensors = new SensorService();
const maintenances = new MaintenanceService();
const failures = new FailureService();
const technicians = new TechnicianService();
const users = new UserService();
const metrics = new MetricsService();
const ingest = new IngestService();
const reports = new ReportService();
const auditLogs = new AuditLogService();

export const api = {
    auth,
    dashboard,
    ingenios,
    machines,
    sensors,
    maintenances,
    failures,
    technicians,
    users,
    metrics,
    ingest,
    reports,
    auditLogs,

    // Legacy:

    // Auth
    login: auth.login.bind(auth),
    logout: auth.logout.bind(auth),
    getSession: auth.getSession.bind(auth),

    // Ingenios
    getAllIngenios: ingenios.getAll.bind(ingenios),
    getIngenio: ingenios.getOne.bind(ingenios),
    createIngenio: ingenios.create.bind(ingenios),
    updateIngenio: ingenios.update.bind(ingenios),
    deleteIngenio: ingenios.delete.bind(ingenios),
    activateIngenio: ingenios.activate.bind(ingenios),
    deactivateIngenio: ingenios.deactivate.bind(ingenios),

    // Machines
    getMachines: machines.getAll.bind(machines),
    getMachine: machines.getOne.bind(machines),
    createMachine: machines.create.bind(machines),
    updateMachine: machines.update.bind(machines),
    deleteMachine: machines.delete.bind(machines),

    // Sensors
    getSensors: sensors.getAll.bind(sensors),
    getSensor: sensors.getOne.bind(sensors),
    createSensor: sensors.create.bind(sensors),
    updateSensor: sensors.update.bind(sensors),
    activateSensor: sensors.activate.bind(sensors),
    deactivateSensor: sensors.deactivate.bind(sensors),
    getSensorReadings: sensors.getReadings.bind(sensors),

    // Maintenances
    getMaintenances: maintenances.getAll.bind(maintenances),
    getMaintenance: maintenances.getOne.bind(maintenances),
    createMaintenance: maintenances.create.bind(maintenances),
    updateMaintenance: maintenances.update.bind(maintenances),
    deleteMaintenance: maintenances.delete.bind(maintenances),

    // Failures
    getFailures: failures.getAll.bind(failures),
    getFailure: failures.getOne.bind(failures),
    createFailure: failures.create.bind(failures),
    updateFailure: failures.update.bind(failures),
    deleteFailure: failures.delete.bind(failures),

    // Technicians
    getTechnicians: technicians.getAll.bind(technicians),
    getTechnician: technicians.getOne.bind(technicians),
    createTechnician: technicians.create.bind(technicians),
    updateTechnician: technicians.update.bind(technicians),
    deleteTechnician: technicians.delete.bind(technicians),

    // Users
    getUsers: users.getAll.bind(users),
    createUser: users.create.bind(users),
    updateUser: users.update.bind(users),
    deleteUser: users.delete.bind(users),
    changePassword: users.changePassword.bind(users),

    // Metrics & Dashboard
    getMachineMetrics: metrics.getMachineMetrics.bind(metrics),
    getIngenioMetrics: metrics.getIngenioMetrics.bind(metrics),
    getSensorHealth: metrics.getSensorHealth.bind(metrics),
    analyzeMachine: metrics.analyzeMachine.bind(metrics),
    getDashboardHistory: dashboard.getHistory.bind(dashboard),
    getRecentActivity: dashboard.getRecentActivity.bind(dashboard),

    // Ingest
    ingestData: ingest.ingestData.bind(ingest),
    ingestSensorData: ingest.ingestSensorData.bind(ingest),
};
