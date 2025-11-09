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
	const [newGroupName, setNewGroupName] = useState("");
	const [newMetricNames, setNewMetricNames] = useState<Record<string, string>>(
		{}
	);

	// Sincronizar cuando cambie el value externo
	useEffect(() => {
		setConfig(value || {});
	}, [value]);

	// Notificar al padre cuando cambie config
	useEffect(() => {
		onChange(config);
	}, [config, onChange]);

	const handleAddGroup = useCallback(() => {
		const name = newGroupName.trim();
		if (!name) return;
		setConfig((prev) => {
			if (prev[name]) {
				alert("Ese grupo ya existe.");
				return prev;
			}
			return { ...prev, [name]: {} };
		});
		setNewGroupName("");
	}, [newGroupName]);

	const handleAddMetric = useCallback(
		(group: string) => {
			const name = (newMetricNames[group] || "").trim();
			if (!name) return;

			setConfig((prev) => {
				const groupObj = prev[group] || {};
				if (groupObj[name]) {
					alert("Esa métrica ya existe en este grupo.");
					return prev;
				}
				return {
					...prev,
					[group]: {
						...groupObj,
						[name]: { min: 0, max: 0 },
					},
				};
			});

			setNewMetricNames((prev) => ({ ...prev, [group]: "" }));
		},
		[newMetricNames]
	);

	const updateMetric = useCallback(
		(group: string, metric: string, field: "min" | "max", value: number) => {
			if (isNaN(value)) return;

			setConfig((prev) => {
				const currentGroup = prev[group];
				if (!currentGroup) return prev;
				const currentMetric = currentGroup[metric];
				if (!currentMetric) return prev;

				const nextMetric = { ...currentMetric, [field]: value };

				if (nextMetric.max < nextMetric.min) {
					alert("El valor máximo no puede ser menor que el mínimo.");
					return prev;
				}

				return {
					...prev,
					[group]: {
						...currentGroup,
						[metric]: nextMetric,
					},
				};
			});
		},
		[]
	);

	const removeMetric = useCallback((group: string, metric: string) => {
		setConfig((prev) => {
			const currentGroup = prev[group];
			if (!currentGroup) return prev;

			const newGroup = { ...currentGroup };
			delete newGroup[metric];

			return { ...prev, [group]: newGroup };
		});
	}, []);

	const removeGroup = useCallback((group: string) => {
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
					Aún no hay grupos definidos. Usa el formulario de abajo para añadir uno
					nuevo.
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

						{/* Añadir métrica inline, sin prompt */}
						<div
							style={{
								display: "flex",
								gap: "0.5rem",
								alignItems: "center",
								marginTop: "0.5rem",
							}}>
							<InputField
								type="text"
								placeholder="Nombre de nueva métrica"
								value={newMetricNames[group] || ""}
								onChange={(e) =>
									setNewMetricNames((prev) => ({
										...prev,
										[group]: e.target.value,
									}))
								}
							/>
							<AddButton type="button" onClick={() => handleAddMetric(group)}>
								+ Añadir métrica
							</AddButton>
						</div>
					</GroupCard>
				);
			})}

			{/* Añadir grupo inline, sin prompt */}
			<div
				style={{
					marginTop: "1rem",
					display: "flex",
					gap: "0.5rem",
					alignItems: "center",
				}}>
				<InputField
					type="text"
					placeholder="Nombre del nuevo grupo"
					value={newGroupName}
					onChange={(e) => setNewGroupName(e.target.value)}
				/>
				<MetricsButton type="button" onClick={handleAddGroup}>
					+ Añadir grupo
				</MetricsButton>
			</div>
		</EditorContainer>
	);
}
