import type { AnalysisResponse, Failure, Maintenance, Reading, Sensor, User } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

class ApiClient {
	private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
		return response.json();
	}

	// --- Sensors ---
	async getSensors(): Promise<Sensor[]> {
		return this.request<Sensor[]>("/sensors");
	}

	async getSensor(sensorId: string): Promise<Sensor> {
		return this.request<Sensor>(`/sensors/${sensorId}`);
	}

	async updateSensor(sensorId: string, data: Partial<Sensor>): Promise<Sensor> {
		return this.request<Sensor>(`/sensors/${sensorId}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deactivateSensor(sensorId: string): Promise<Sensor> {
		return this.request<Sensor>(`/sensors/${sensorId}/deactivate`, {
			method: "PATCH",
		});
	}

	// --- Maintenance ---
	async getMaintenances(): Promise<Maintenance[]> {
		return this.request<Maintenance[]>("/maintenances");
	}

	async createMaintenance(data: Partial<Maintenance>): Promise<Maintenance> {
		return this.request<Maintenance>("/maintenances", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	// --- Failures ---
	async getFailures(): Promise<Failure[]> {
		return this.request<Failure[]>("/failures");
	}

	async createFailure(data: Partial<Failure>): Promise<Failure> {
		return this.request<Failure>("/failures", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	// --- Users ---
	async getUsers(): Promise<User[]> {
		return this.request<User[]>("/users");
	}

	async createUser(data: Partial<User>): Promise<User> {
		return this.request<User>("/users", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	// --- Analysis ---
	async analyzeData(sensorIds: string[]): Promise<AnalysisResponse> {
		return this.request<AnalysisResponse>("/analyze", {
			method: "POST",
			body: JSON.stringify(sensorIds),
		});
	}

	// --- Ingest ---
	async ingestData(data: any): Promise<void> {
		return this.request<void>("/ingest", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async ingestSensorData(data: any): Promise<void> {
		return this.request<void>("/ingest/sensor", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	// --- Readings ---
	async getSensorReadings(sensorId: string): Promise<Reading[]> {
		return this.request<Reading[]>(`/sensors/${sensorId}/readings`);
	}
}

export const api = new ApiClient();
