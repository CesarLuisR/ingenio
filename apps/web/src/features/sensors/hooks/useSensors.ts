import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "../../../lib/api";
import type { Sensor } from "../../../types";

export function useSensors() {
	const [sensors, setSensors] = useState<Sensor[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	// Load sensors from the backend
	const loadSensors = useCallback(async () => {
		setLoading(true);
		try {
			const data = await api.getSensors();
			setSensors(data);
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
			// update local state so UI reacts immediately
			setSensors((prev) =>
				prev.map((s) =>
					s.sensorId === sensorId ? { ...s, active: false } : s
				)
			);
		} catch (error) {
			console.error("Error desactivando sensor:", error);
		}
	}, []);

	// Filtering
	const filteredSensors = useMemo(() => {
		const term = searchTerm.toLowerCase();
		return sensors.filter((s) => {
			const nameMatch = s.name.toLowerCase().includes(term);
			const locationMatch = s.location?.toLowerCase().includes(term);
			return nameMatch || locationMatch;
		});
	}, [sensors, searchTerm]);

	// Initial load
	useEffect(() => {
		loadSensors();
	}, [loadSensors]);

	return {
		sensors,
		filteredSensors,
		loading,
		searchTerm,
		setSearchTerm,
		reload: loadSensors,
		deactivateSensor,
	};
}
