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
} from "../types";

const API_BASE_URL =
	import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

class ApiClient {
	private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
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

	// ======================
	// 🔐 AUTH
	// ======================

	async login(email: string, password: string): Promise<User> {
		const data = await this.request<{ user: User }>("/api/auth/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		});
		return data.user;
	}

	async logout(): Promise<void> {
		return this.request<void>("/api/auth/logout", {
			method: "POST",
		});
	}

	async getSession(): Promise<User | null> {
		try {
			const data = await this.request<{ user: User | null }>("/api/auth/session");
			return data.user ?? null;
		} catch {
			return null;
		}
	}

	// ======================
	// 🌾 INGENIOS
	// ======================

	getIngenios(): Promise<Ingenio[]> {
		return this.request<Ingenio[]>("/api/ingenios");
	}

	getIngenio(id: number): Promise<Ingenio> {
		return this.request<Ingenio>(`/api/ingenios/${id}`);
	}

	createIngenio(data: Partial<Ingenio>): Promise<Ingenio> {
		return this.request<Ingenio>("/api/ingenios", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	updateIngenio(id: number, data: Partial<Ingenio>): Promise<Ingenio> {
		return this.request<Ingenio>(`/api/ingenios/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	deleteIngenio(id: number): Promise<void> {
		return this.request<void>(`/api/ingenios/${id}`, {
			method: "DELETE",
		});
	}

	// ======================
	// 🏭 MACHINES
	// ======================

	getMachines(): Promise<Machine[]> {
		return this.request<Machine[]>("/api/machines");
	}

	getMachine(id: number): Promise<Machine> {
		return this.request<Machine>(`/api/machines/${id}`);
	}

	createMachine(data: Partial<Machine>): Promise<Machine> {
		return this.request<Machine>("/api/machines", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	updateMachine(id: number, data: Partial<Machine>): Promise<Machine> {
		return this.request<Machine>(`/api/machines/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	deleteMachine(id: number): Promise<void> {
		return this.request<void>(`/api/machines/${id}`, {
			method: "DELETE",
		});
	}

	// ======================
	// 📊 METRICS
	// ======================

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

	// ======================
	// 📡 SENSORS
	// ======================

	getSensors(): Promise<Sensor[]> {
		return this.request<Sensor[]>("/api/sensors");
	}

	getSensor(sensorId: string): Promise<Sensor> {
		return this.request<Sensor>(`/api/sensors/${sensorId}`);
	}

	updateSensor(sensorId: string, data: Partial<Sensor>): Promise<Sensor> {
		return this.request<Sensor>(`/api/sensors/${sensorId}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	deactivateSensor(sensorId: string): Promise<Sensor> {
		// backend: PATCH /api/sensors/:sensorId/deactivate
		return this.request<Sensor>(`/api/sensors/${sensorId}/deactivate`, {
			method: "PATCH",
		});
	}

	getSensorReadings(sensorId: string): Promise<Reading[]> {
		return this.request<Reading[]>(`/api/sensors/${sensorId}/readings`);
	}

	// ======================
	// 🛠 MAINTENANCES
	// ======================

	getMaintenances(): Promise<Maintenance[]> {
		return this.request<Maintenance[]>("/api/maintenances");
	}

	getMaintenance(id: string): Promise<Maintenance> {
		return this.request<Maintenance>(`/api/maintenances/${id}`);
	}

	createMaintenance(data: Partial<Maintenance>): Promise<Maintenance> {
		return this.request<Maintenance>("/api/maintenances", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	updateMaintenance(id: string, data: Partial<Maintenance>): Promise<Maintenance> {
		return this.request<Maintenance>(`/api/maintenances/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	deleteMaintenance(id: string): Promise<void> {
		return this.request<void>(`/api/maintenances/${id}`, {
			method: "DELETE",
		});
	}

	// ======================
	// ⚠️ FAILURES
	// ======================

	getFailures(): Promise<Failure[]> {
		return this.request<Failure[]>("/api/failures");
	}

	getFailure(id: string): Promise<Failure> {
		return this.request<Failure>(`/api/failures/${id}`);
	}

	createFailure(data: Partial<Failure>): Promise<Failure> {
		return this.request<Failure>("/api/failures", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	updateFailure(id: string, data: Partial<Failure>): Promise<Failure> {
		return this.request<Failure>(`/api/failures/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	deleteFailure(id: string): Promise<void> {
		return this.request<void>(`/api/failures/${id}`, {
			method: "DELETE",
		});
	}

	// ======================
	// 👷 TECHNICIANS
	// ======================

	getTechnicians(): Promise<Technician[]> {
		return this.request<Technician[]>("/api/technicians");
	}

	getTechnician(id: string): Promise<Technician> {
		return this.request<Technician>(`/api/technicians/${id}`);
	}

	createTechnician(data: Partial<Technician>): Promise<Technician> {
		return this.request<Technician>("/api/technicians", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	updateTechnician(id: string, data: Partial<Technician>): Promise<Technician> {
		return this.request<Technician>(`/api/technicians/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	deleteTechnician(id: string): Promise<void> {
		return this.request<void>(`/api/technicians/${id}`, {
			method: "DELETE",
		});
	}

	// ======================
	// 👤 USERS
	// ======================

	getUsers(): Promise<User[]> {
		return this.request<User[]>("/api/users");
	}

	createUser(data: Partial<User>): Promise<User> {
		return this.request<User>("/api/users", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	updateUser(id: string, data: Partial<User>): Promise<User> {
		return this.request<User>(`/api/users/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	deleteUser(id: string): Promise<void> {
		return this.request<void>(`/api/users/${id}`, {
			method: "DELETE",
		});
	}

	// ======================
	// 🧠 ANALYSIS
	// ======================

	analyzeData(sensorIds: string[]): Promise<AnalysisResponse> {
		return this.request<AnalysisResponse>("/api/analyze", {
			method: "POST",
			body: JSON.stringify(sensorIds),
		});
	}

	// ======================
	// 🔄 INGEST
	// ======================

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

export const api = new ApiClient();
