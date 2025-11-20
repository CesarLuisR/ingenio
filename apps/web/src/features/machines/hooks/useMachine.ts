// src/modules/machines/useMachines.ts
import { useCallback, useEffect, useState } from "react";
import { api } from "../../../lib/api";
import type {
	Machine,
	Sensor,
	Maintenance,
	Failure,
} from "../../../types";
import { useSessionStore } from "../../../store/sessionStore";

export type MachineWithRelations = Machine & {
	sensors?: Sensor[];
	maintenances?: Maintenance[];
	failures?: Failure[];
};

interface UseMachinesResult {
	machines: MachineWithRelations[];
	loading: boolean;
	error: string | null;
	reload: () => Promise<void>;
	setMachines: React.Dispatch<React.SetStateAction<MachineWithRelations[]>>;
}

export function useMachines(): UseMachinesResult {
	const { user } = useSessionStore();
	const [machines, setMachines] = useState<MachineWithRelations[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadMachines = useCallback(async () => {
		if (!user?.ingenioId) {
			setMachines([]);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			// 1) Cargar máquinas
			const machinesRaw = await api.getMachines();

			let filtered: MachineWithRelations[] = machinesRaw.filter(
				(m) => m.ingenioId === user.ingenioId
			);

			// 2) Detectar si faltan relaciones
			const needsSensors = filtered.some((m) => m.sensors == null);
			const needsMaintenances = filtered.some((m) => m.maintenances == null);
			const needsFailures = filtered.some((m) => m.failures == null);

			let sensorsByMachine: Record<number, Sensor[]> = {};
			let maintsByMachine: Record<number, Maintenance[]> = {};
			let failuresByMachine: Record<number, Failure[]> = {};

			// 3) Si faltan, llamar a los endpoints específicos
			if (needsSensors) {
				const allSensors = await api.getSensors();
				const sensorsForIngenio = allSensors.filter(
					(s) => s.ingenioId === user.ingenioId
				);
				for (const sensor of sensorsForIngenio) {
					if (!sensor.machineId) continue;
					if (!sensorsByMachine[sensor.machineId]) {
						sensorsByMachine[sensor.machineId] = [];
					}
					sensorsByMachine[sensor.machineId].push(sensor);
				}
			}

			if (needsMaintenances) {
				const allMaints = await api.getMaintenances();
				const maintsForIngenio = allMaints.filter(
					(m) => m.ingenioId === user.ingenioId
				);
				for (const mt of maintsForIngenio) {
					if (!mt.machineId) continue;
					if (!maintsByMachine[mt.machineId]) {
						maintsByMachine[mt.machineId] = [];
					}
					maintsByMachine[mt.machineId].push(mt);
				}
			}

			if (needsFailures) {
				const allFails = await api.getFailures();
				const failsForIngenio = allFails.filter(
					(f) => f.ingenioId === user.ingenioId
				);
				for (const f of failsForIngenio) {
					if (!f.machineId) continue;
					if (!failuresByMachine[f.machineId]) {
						failuresByMachine[f.machineId] = [];
					}
					failuresByMachine[f.machineId].push(f);
				}
			}

			// 4) Enriquecer máquinas con relaciones faltantes
			filtered = filtered.map((m) => ({
				...m,
				sensors: m.sensors ?? sensorsByMachine[m.id] ?? [],
				maintenances:
					m.maintenances ?? maintsByMachine[m.id] ?? [],
				failures: m.failures ?? failuresByMachine[m.id] ?? [],
			}));

			setMachines(filtered);
		} catch (e: any) {
			console.error("Error loading machines", e);
			setError(e.message || "Error al cargar máquinas");
		} finally {
			setLoading(false);
		}
	}, [user?.ingenioId]);

	useEffect(() => {
		void loadMachines();
	}, [loadMachines]);

	return {
		machines,
		loading,
		error,
		reload: loadMachines,
		setMachines,
	};
}
