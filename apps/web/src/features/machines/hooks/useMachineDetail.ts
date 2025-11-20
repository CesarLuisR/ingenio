// src/modules/machines/useMachineDetail.ts
import { useCallback, useEffect, useState } from "react";
import { api } from "../../../lib/api";
import type { Machine, Sensor, Maintenance, Failure, BaseMetrics } from "../../../types";
import { useSessionStore } from "../../../store/sessionStore";

export interface MachineDetailData {
	machine: Machine | null;
	sensors: Sensor[];
	maintenances: Maintenance[];
	failures: Failure[];
	metrics: BaseMetrics | null;
	loading: boolean;
	error: string | null;
	reload: () => Promise<void>;
}

export function useMachineDetail(machineId: number): MachineDetailData {
	const { user } = useSessionStore();

	const [machine, setMachine] = useState<Machine | null>(null);
	const [sensors, setSensors] = useState<Sensor[]>([]);
	const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
	const [failures, setFailures] = useState<Failure[]>([]);
	const [metrics, setMetrics] = useState<BaseMetrics | null>(null);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const reload = useCallback(async () => {
		if (!user?.ingenioId) {
			setError("Usuario sin ingenio asignado");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			// 1) Cargar máquina
			const m = await api.getMachine(machineId);

			if (!m || m.ingenioId !== user.ingenioId)
				throw new Error("Máquina no pertenece al ingenio del usuario");

			setMachine(m);

			// 2) Relaciones directas si vienen del backend
			const sensorsInline = m.sensors ?? [];
			const maintInline = m.maintenances ?? [];
			const failsInline = m.failures ?? [];

			// 3) Ver si necesitamos fetch extra
			const needSensors = sensorsInline.length === 0;
			const needMaints = maintInline.length === 0;
			const needFails = failsInline.length === 0;

			let sensorsData = sensorsInline;
			let maintsData = maintInline;
			let failsData = failsInline;

			if (needSensors) {
				const all = await api.getSensors();
				sensorsData = all.filter(
					(s) => s.machineId === m.id && s.ingenioId === user.ingenioId
				);
			}

			if (needMaints) {
				const all = await api.getMaintenances();
				maintsData = all.filter(
					(mt) => mt.machineId === m.id && mt.ingenioId === user.ingenioId
				);
			}

			if (needFails) {
				const all = await api.getFailures();
				failsData = all.filter(
					(f) => f.machineId === m.id && f.ingenioId === user.ingenioId
				);
			}

			setSensors(sensorsData);
			setMaintenances(maintsData);
			setFailures(failsData);

			// 4) Métricas de rendimiento
			const metricsData = await api.getMachineMetrics(m.id);
			setMetrics(metricsData);

		} catch (e: any) {
			setError(e?.message ?? "Error cargando los datos de la máquina");
		} finally {
			setLoading(false);
		}
	}, [machineId, user?.ingenioId]);

	useEffect(() => {
		void reload();
	}, [reload]);

	return {
		machine,
		sensors,
		maintenances,
		failures,
		metrics,
		loading,
		error,
		reload,
	};
}
