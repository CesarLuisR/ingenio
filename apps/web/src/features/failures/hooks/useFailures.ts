import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import type { Failure, Machine, Sensor } from "../../../types";

const normalize = (s: string) =>
	s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export default function useFailures() {
	const [failures, setFailures] = useState<Failure[]>([]);
	const [machines, setMachines] = useState<Machine[]>([]);
	const [sensors, setSensors] = useState<Sensor[]>([]);
	const [loading, setLoading] = useState(true);

	const [editing, setEditing] = useState<Failure | null>(null);
	const [showForm, setShowForm] = useState(false);

	// filtros
	const [filterMachineId, setFilterMachineId] = useState("");
	const [filterSensorId, setFilterSensorId] = useState("");
	const [filterSeverity, setFilterSeverity] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [filterText, setFilterText] = useState("");

	useEffect(() => {
		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadData = async () => {
		try {
			const [failuresData, machinesData, sensorsData] = await Promise.all([
				api.getFailures(),
				api.getMachines(),
				api.getSensors(),
			]);

			setFailures(failuresData);
			setMachines(machinesData);
			setSensors(sensorsData);
		} catch (err) {
			console.error("Error cargando datos:", err);
		} finally {
			setLoading(false);
		}
	};

	const filteredFailures = failures.filter((f) => {
		if (filterMachineId && f.machineId.toString() !== filterMachineId)
			return false;

		if (filterSensorId && f.sensorId?.toString() !== filterSensorId)
			return false;

		if (filterSeverity && (f.severity || "") !== filterSeverity)
			return false;

		if (filterStatus && (f.status || "") !== filterStatus)
			return false;

		if (filterText) {
			const t = normalize(filterText);

			const machine = machines.find((m) => m.id === f.machineId);
			const sensor = sensors.find((s) => s.id === f.sensorId);

			const haystack =
				normalize(f.description || "") +
				" " +
				normalize(machine?.name || "") +
				" " +
				normalize(sensor?.name || "");

			if (!haystack.includes(t)) return false;
		}

		return true;
	});

	return {
		failures,
		machines,
		sensors,
		loading,

		filteredFailures,

		editing,
		setEditing,
		showForm,
		setShowForm,

		filterMachineId,
		setFilterMachineId,
		filterSensorId,
		setFilterSensorId,
		filterSeverity,
		setFilterSeverity,
		filterStatus,
		setFilterStatus,
		filterText,
		setFilterText,

		loadData,
	};
}
