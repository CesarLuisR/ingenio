import { useEffect, useState } from "react";
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

	// Reset when value changes (e.g. editing different sensor)
	useEffect(() => {
		setConfig(value || {});
	}, [value]);

	// Sync with parent
	useEffect(() => {
		onChange(config);
	}, [config, onChange]);

	const addGroup = () => {
		const name = prompt("Nombre del nuevo grupo:");
		if (!name) return;
		if (config[name]) return alert("Ese grupo ya existe.");
		setConfig((prev) => ({ ...prev, [name]: {} }));
	};

	const addMetric = (group: string) => {
		const name = prompt(`Nombre de la métrica en ${group}:`);
		if (!name) return;
		if (config[group]?.[name]) return alert("Esa métrica ya existe.");
		setConfig((prev) => ({
			...prev,
			[group]: { ...prev[group], [name]: { min: 0, max: 0 } },
		}));
	};

	const updateMetric = (
		group: string,
		metric: string,
		field: "min" | "max",
		value: number
	) => {
		if (isNaN(value)) return;
		setConfig((prev) => ({
			...prev,
			[group]: {
				...prev[group],
				[metric]: { ...prev[group][metric], [field]: value },
			},
		}));
	};

	const removeMetric = (group: string, metric: string) => {
		if (!confirm(`¿Eliminar la métrica "${metric}" de ${group}?`)) return;
		setConfig((prev) => {
			const newGroup = { ...prev[group] };
			delete newGroup[metric];
			return { ...prev, [group]: newGroup };
		});
	};

	const removeGroup = (group: string) => {
		if (!confirm(`¿Eliminar el grupo "${group}" completo?`)) return;
		setConfig((prev) => {
			const newConfig = { ...prev };
			delete newConfig[group];
			return newConfig;
		});
	};

	return (
		<EditorContainer>
			<EditorHeader>Configuración del Sensor</EditorHeader>

			{Object.keys(config).length === 0 && (
				<p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
					Aún no hay grupos definidos. Usa el botón para añadir uno nuevo.
				</p>
			)}

			{Object.keys(config).map((group) => {
				const metrics = config[group] || {};
				const isObject = typeof metrics === "object" && !Array.isArray(metrics);

				return (
					<GroupCard key={group}>
						<GroupHeader>
							<GroupTitle>{group}</GroupTitle>
							<DeleteButton onClick={() => removeGroup(group)}>🗑️</DeleteButton>
						</GroupHeader>

						{isObject &&
							Object.entries(metrics).map(([metric, vals]: any) => {
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
