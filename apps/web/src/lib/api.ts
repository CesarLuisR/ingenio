import type {
	AnalysisResponse,
	Failure,
	Maintenance,
	Reading,
	Sensor,
	Technician,
	User,
} from "../types";

const API_BASE_URL =
	import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

class ApiClient {
	private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			...options,
			headers: {
				"Content-Type": "application/json",
				...options?.headers,
			},
		});

		// Manejo de error HTTP
		if (!response.ok) {
			const errText = await response.text();
			throw new Error(`API Error ${response.status}: ${errText}`);
		}

		// Si no hay contenido (DELETE, 204, etc.), evita .json() vacío
		if (response.status === 204) return undefined as T;

		return response.json();
	}

	// ======================
	// 🔐 AUTH
	// ======================

	async login(email: string, password: string): Promise<User> {
		const data = await this.request<{ user: User }>("/api/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		});
		return data.user;
	}

	async logout(): Promise<void> {
		return this.request<void>("/api/logout", {
			method: "POST",
		});
	}

	// Obtiene la sesión actual desde el backend (si existe)
	async getSession(): Promise<User | null> {
		try {
			const data = await this.request<{ user: User | null }>("/api/session", {
				method: "GET",
			});
			return data.user ?? null;
		} catch {
			return null;
		}
	}

	// --- Sensors ---
	async getSensors(): Promise<Sensor[]> {
		return this.request<Sensor[]>("/api/sensors");
	}

	async getSensor(sensorId: string): Promise<Sensor> {
		return this.request<Sensor>(`/api/sensors/${sensorId}`);
	}

	async updateSensor(sensorId: string, data: Partial<Sensor>): Promise<Sensor> {
		return this.request<Sensor>(`/api/sensors/${sensorId}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deactivateSensor(sensorId: string): Promise<Sensor> {
		return this.request<Sensor>(`/api/sensors/${sensorId}/deactivate`, {
			method: "PATCH",
		});
	}

	// --- Maintenances ---
	async getMaintenances(): Promise<Maintenance[]> {
		return this.request<Maintenance[]>("/api/maintenances");
	}

	async getMaintenance(id: string): Promise<Maintenance> {
		return this.request<Maintenance>(`/api/maintenances/${id}`);
	}

	async createMaintenance(data: Partial<Maintenance>): Promise<Maintenance> {
		return this.request<Maintenance>("/api/maintenances", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateMaintenance(
		id: string,
		data: Partial<Maintenance>
	): Promise<Maintenance> {
		return this.request<Maintenance>(`/api/maintenances/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteMaintenance(id: string): Promise<void> {
		return this.request<void>(`/api/maintenances/${id}`, {
			method: "DELETE",
		});
	}

	// --- Failures ---
	async getFailures(): Promise<Failure[]> {
		return this.request<Failure[]>("/api/failures");
	}

	async getFailure(id: string): Promise<Failure> {
		return this.request<Failure>(`/api/failures/${id}`);
	}

	async createFailure(data: Partial<Failure>): Promise<Failure> {
		return this.request<Failure>("/api/failures", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateFailure(id: string, data: Partial<Failure>): Promise<Failure> {
		return this.request<Failure>(`/api/failures/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteFailure(id: string): Promise<void> {
		return this.request<void>(`/api/failures/${id}`, {
			method: "DELETE",
		});
	}

	// --- Technicians ---
	async getTechnicians(): Promise<Technician[]> {
		return this.request<Technician[]>("/api/technicians");
	}

	async getTechnician(id: string): Promise<Technician> {
		return this.request<Technician>(`/api/technicians/${id}`);
	}

	async createTechnician(data: Partial<Technician>): Promise<Technician> {
		return this.request<Technician>("/api/technicians", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateTechnician(
		id: string,
		data: Partial<Technician>
	): Promise<Technician> {
		return this.request<Technician>(`/api/technicians/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteTechnician(id: string): Promise<void> {
		return this.request<void>(`/api/technicians/${id}`, {
			method: "DELETE",
		});
	}

	// --- Users ---
	async getUsers(): Promise<User[]> {
		return this.request<User[]>("/api/users");
	}

	async createUser(data: Partial<User>): Promise<User> {
		return this.request<User>("/api/users", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	// --- Analysis ---
	async analyzeData(sensorIds: string[]): Promise<AnalysisResponse> {
		return this.request<AnalysisResponse>("/api/analyze", {
			method: "POST",
			body: JSON.stringify(sensorIds),
		});
	}

	// --- Ingest ---
	async ingestData(data: any): Promise<void> {
		return this.request<void>("/api/ingest", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async ingestSensorData(data: any): Promise<void> {
		return this.request<void>("/api/ingest/sensor", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	// --- Readings ---
	async getSensorReadings(sensorId: string): Promise<Reading[]> {
		return this.request<Reading[]>(`/api/sensors/${sensorId}/readings`);
	}
}

export const api = new ApiClient();
