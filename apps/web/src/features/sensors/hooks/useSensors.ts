import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "../../../lib/api";
import type { Sensor, Machine } from "../../../types";

export function useSensors() {
	const [sensors, setSensors] = useState<Sensor[]>([]);
	const [machines, setMachines] = useState<Machine[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	// Load sensors & machines from backend
	const loadSensors = useCallback(async () => {
		setLoading(true);
		try {
			const [sensorData, machineData] = await Promise.all([
				api.getSensors(),
				api.getMachines(), // 🔥 ahora cargas máquinas SIEMPRE
			]);

			setSensors(sensorData);
			setMachines(machineData);
		} catch (error) {
			console.error("Error cargando sensores:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	// Deactivate (soft delete)
	const deactivateSensor = useCallback(async (sensorId: string) => {
		try {
			await api.deactivateSensor(sensorId);

			setSensors((prev) =>
				prev.map((s) =>
					(s.sensorId ?? String(s.id)) === sensorId
						? { ...s, active: false }
						: s
				)
			);
		} catch (error) {
			console.error("Error desactivando sensor:", error);
		}
	}, []);

	// JOIN: enrich sensors with machine info
	const sensorsWithMachine = useMemo(() => {
		return sensors.map((s) => {
			const machine = machines.find((m) => m.id === s.machineId) || null;
			return { ...s, machine };
		});
	}, [sensors, machines]);

	// Filtering by search
	const filteredSensors = useMemo(() => {
		const term = searchTerm.toLowerCase().trim();

		if (!term) return sensorsWithMachine;

		return sensorsWithMachine.filter((s) => {
			const nameMatch = s.name.toLowerCase().includes(term);
			const machineMatch =
				s.machine?.name.toLowerCase().includes(term) ||
				s.machine?.code?.toLowerCase().includes(term);

			const locationMatch = s.location?.toLowerCase().includes(term);

			return nameMatch || machineMatch || locationMatch;
		});
	}, [sensorsWithMachine, searchTerm]);

	// Initial load
	useEffect(() => {
		loadSensors();
	}, [loadSensors]);

	return {
		sensors: sensorsWithMachine,
		machines,
		filteredSensors,
		loading,
		searchTerm,
		setSearchTerm,
		reload: loadSensors,
		deactivateSensor,
	};
}
