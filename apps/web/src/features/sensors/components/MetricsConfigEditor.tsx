import { useState, useEffect, useCallback } from "react";
import {
	EditorContainer,
	EditorHeader,
	GroupCard,
	GroupHeader,
	GroupTitle,
	MetricRow,
	InputField,
	MetricsLabel,
	MetricsButton,
	AddButton,
	DeleteButton,
} from "../styled";

export default function MetricsConfigEditor({
	value,
	onChange,
}: {
	value: Record<string, any>;
	onChange: (val: any) => void;
}) {
	const [config, setConfig] = useState<Record<string, any>>(value || {});

	// Evitar renders innecesarios si la referencia no cambió
	useEffect(() => {
		setConfig(value || {});
	}, [value]);

	// Notificar al padre solo cuando config realmente cambia
	useEffect(() => {
		onChange(config);
	}, [config, onChange]);

	const addGroup = useCallback(() => {
		const name = prompt("Nombre del nuevo grupo:");
		if (!name) return;
		if (config[name]) return alert("Ese grupo ya existe.");
		setConfig((prev) => ({ ...prev, [name]: {} }));
	}, [config]);

	const addMetric = useCallback(
		(group: string) => {
			const name = prompt(`Nombre de la métrica en ${group}:`);
			if (!name) return;
			if (config[group]?.[name]) return alert("Esa métrica ya existe.");
			setConfig((prev) => ({
				...prev,
				[group]: { ...prev[group], [name]: { min: 0, max: 0 } },
			}));
		},
		[config]
	);

	const updateMetric = useCallback(
		(group: string, metric: string, field: "min" | "max", value: number) => {
			if (isNaN(value)) return;
			setConfig((prev) => {
				const newGroup = {
					...prev[group],
					[metric]: { ...prev[group][metric], [field]: value },
				};
				return { ...prev, [group]: newGroup };
			});
		},
		[]
	);

	const removeMetric = useCallback(
		(group: string, metric: string) => {
			if (!confirm(`¿Eliminar la métrica "${metric}" de ${group}?`)) return;
			setConfig((prev) => {
				const newGroup = { ...prev[group] };
				delete newGroup[metric];
				return { ...prev, [group]: newGroup };
			});
		},
		[]
	);

	const removeGroup = useCallback((group: string) => {
		if (!confirm(`¿Eliminar el grupo "${group}" completo?`)) return;
		setConfig((prev) => {
			const newConfig = { ...prev };
			delete newConfig[group];
			return newConfig;
		});
	}, []);

	return (
		<EditorContainer>
			<EditorHeader>Configuración del Sensor</EditorHeader>

			{Object.keys(config).length === 0 && (
				<p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
					Aún no hay grupos definidos. Usa el botón para añadir uno nuevo.
				</p>
			)}

			{Object.entries(config).map(([group, metrics]) => {
				const isObject = typeof metrics === "object" && !Array.isArray(metrics);
				if (!isObject) return null;

				return (
					<GroupCard key={group}>
						<GroupHeader>
							<GroupTitle>{group}</GroupTitle>
							<DeleteButton onClick={() => removeGroup(group)}>🗑️</DeleteButton>
						</GroupHeader>

						{Object.entries(metrics).map(([metric, vals]: any) => {
							const hasMinMax =
								vals &&
								typeof vals === "object" &&
								"min" in vals &&
								"max" in vals;

							return (
								<MetricRow key={metric}>
									<strong>{metric}</strong>
									{hasMinMax ? (
										<>
											<MetricsLabel>
												min:
												<InputField
													type="number"
													value={vals.min}
													onChange={(e) =>
														updateMetric(
															group,
															metric,
															"min",
															parseFloat(e.target.value)
														)
													}
												/>
											</MetricsLabel>
											<MetricsLabel>
												max:
												<InputField
													type="number"
													value={vals.max}
													onChange={(e) =>
														updateMetric(
															group,
															metric,
															"max",
															parseFloat(e.target.value)
														)
													}
												/>
											</MetricsLabel>
										</>
									) : (
										<span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
											(Valor no editable)
										</span>
									)}

									<DeleteButton
										onClick={() => removeMetric(group, metric)}>
										🗑️
									</DeleteButton>
								</MetricRow>
							);
						})}

						<AddButton onClick={() => addMetric(group)}>
							+ Añadir métrica
						</AddButton>
					</GroupCard>
				);
			})}

			<MetricsButton onClick={addGroup}>+ Añadir grupo</MetricsButton>
		</EditorContainer>
	);
}
