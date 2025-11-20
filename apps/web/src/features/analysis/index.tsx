import type React from "react";
import { useState, useEffect } from "react";
import styled from "styled-components";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { api } from "../../lib/api";
import { type AnalysisResponse, type Sensor } from "../../types";

// === estilos base ===
const Container = styled.div`
	padding: 0;
`;

const Title = styled.h1`
	font-size: 30px;
	font-weight: bold;
	color: #111827;
	margin: 0 0 24px 0;
`;

const FormCard = styled.div`
	background: white;
	border-radius: 8px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	padding: 24px;
	margin-bottom: 24px;
`;

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const Button = styled.button`
	padding: 10px 24px;
	background-color: #2563eb;
	color: white;
	border: none;
	border-radius: 8px;
	cursor: pointer;
	font-weight: 500;
	transition: background-color 0.2s;

	&:hover:not(:disabled) {
		background-color: #1d4ed8;
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

const CheckboxGroup = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 12px;
	margin-bottom: 16px;
`;

const CheckboxLabel = styled.label`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	background-color: #f9fafb;
	border-radius: 6px;
	cursor: pointer;
	transition: background-color 0.2s;

	&:hover {
		background-color: #f3f4f6;
	}
`;

const Checkbox = styled.input`
	cursor: pointer;
`;

const ResultsContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 24px;
`;

const Section = styled.div`
	background: white;
	border-radius: 8px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	padding: 24px;
`;

const SectionTitle = styled.h2`
	font-size: 20px;
	font-weight: 600;
	color: #111827;
	margin: 0 0 16px 0;
`;

const ChartContainer = styled.div`
	height: 300px;
	margin-top: 16px;
`;

const MetricCard = styled.div`
	padding: 12px;
	background-color: #f9fafb;
	border-radius: 8px;
	margin-bottom: 8px;
`;

const MetricName = styled.div`
	font-weight: 600;
	color: #111827;
	margin-bottom: 8px;
`;

const MetricDetails = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	gap: 8px;
	font-size: 0.875rem;
`;

const MetricDetail = styled.div`
	color: #374151;
`;

const MetricLabel = styled.span`
	color: #6b7280;
`;

const UrgencyBadge = styled.span<{ $urgency: string }>`
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
	font-weight: 500;
	background-color: ${(props) =>
		props.$urgency.includes("fuera de rango")
			? "#fee2e2"
			: props.$urgency.includes("muy alta")
			? "#ffedd5"
			: props.$urgency === "moderada"
			? "#fef3c7"
			: "#d1fae5"};
	color: ${(props) =>
		props.$urgency.includes("fuera de rango")
			? "#991b1b"
			: props.$urgency.includes("muy alta")
			? "#9a3412"
			: props.$urgency === "moderada"
			? "#92400e"
			: "#065f46"};
`;

// === componente principal ===
export default function Analisis() {
	const [sensors, setSensors] = useState<Sensor[]>([]);
	const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<AnalysisResponse | null>(null);

	// cargar sensores al montar
	useEffect(() => {
		const loadSensors = async () => {
			try {
				const data = await api.getSensors();
				const validSensors = data.filter(
					(s) => typeof s.sensorId === "string"
				);
				setSensors(validSensors);
			} catch (error) {
				console.error("[v0] Error cargando sensores:", error);
			}
		};
		loadSensors();
	}, []);

	const handleSensorToggle = (sensorId: string) => {
		setSelectedSensors((prev) =>
			prev.includes(sensorId)
				? prev.filter((id) => id !== sensorId)
				: [...prev, sensorId]
		);
	};

	const handleAnalyze = async (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedSensors.length === 0) {
			alert("Selecciona al menos un sensor");
			return;
		}

		setLoading(true);
		try {
			console.log(
				"[v0] Enviando análisis para sensores:",
				selectedSensors
			);
			const data = await api.analyzeData(selectedSensors);
			console.log("[v0] Resultado del análisis:", data);
			setResult(data);
		} catch (error) {
			console.error("[v0] Error analizando datos:", error);
			alert("Error al analizar los datos. Verifica la consola.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container>
			<Title>Análisis de Datos</Title>

			<FormCard>
				<Form onSubmit={handleAnalyze}>
					<div>
						<h3
							style={{
								marginTop: 0,
								marginBottom: "12px",
								color: "#374151",
							}}>
							Selecciona los sensores a analizar:
						</h3>
						<CheckboxGroup>
							{sensors.map((sensor) => (
								<CheckboxLabel key={sensor.sensorId}>
									<Checkbox
										type="checkbox"
										checked={selectedSensors.includes(
											sensor.sensorId
										)}
										onChange={() =>
											handleSensorToggle(sensor.sensorId)
										}
									/>
									{sensor.name} ({sensor.sensorId})
								</CheckboxLabel>
							))}
						</CheckboxGroup>
					</div>
					<Button
						type="submit"
						disabled={loading || selectedSensors.length === 0}>
						{loading ? "Analizando..." : "Analizar Sensores"}
					</Button>
				</Form>
			</FormCard>

			{result && (
				<ResultsContainer>
					{result.report.map((sensorReport) => (
						<Section key={sensorReport.sensorId}>
							<SectionTitle>
								📊 Sensor: {sensorReport.sensorId}
							</SectionTitle>

							{Object.entries(sensorReport.resumen).map(
								([category, metrics]) => (
									<div
										key={category}
										style={{ marginBottom: "20px" }}>
										<h3
											style={{
												color: "#111827",
												marginBottom: "12px",
											}}>
											{category.toUpperCase()}
										</h3>
										{Object.entries(metrics).map(
											([metricName, analysis]: [
												string,
												any
											]) => {
												if (analysis.message) {
													return (
														<MetricCard
															key={metricName}>
															<MetricName>
																{metricName}
															</MetricName>
															<div
																style={{
																	color: "#6b7280",
																}}>
																{
																	analysis.message
																}
															</div>
														</MetricCard>
													);
												}

												return (
													<MetricCard
														key={metricName}>
														<MetricName>
															{metricName}
														</MetricName>
														<MetricDetails>
															<MetricDetail>
																<MetricLabel>
																	Tendencia:
																</MetricLabel>{" "}
																{
																	analysis.tendencia
																}{" "}
																{analysis.tendencia ===
																"subiendo"
																	? "📈"
																	: analysis.tendencia ===
																	  "bajando"
																	? "📉"
																	: "➡️"}
															</MetricDetail>
															<MetricDetail>
																<MetricLabel>
																	Valor
																	Actual:
																</MetricLabel>{" "}
																{analysis.valorActual?.toFixed(
																	2
																)}
															</MetricDetail>
															<MetricDetail>
																<MetricLabel>
																	Pendiente:
																</MetricLabel>{" "}
																{analysis.pendiente?.toExponential(
																	2
																)}
															</MetricDetail>
															<MetricDetail>
																<MetricLabel>
																	Urgencia:
																</MetricLabel>{" "}
																<UrgencyBadge
																	$urgency={
																		analysis.urgencia
																	}>
																	{
																		analysis.urgencia
																	}
																</UrgencyBadge>
															</MetricDetail>
														</MetricDetails>
													</MetricCard>
												);
											}
										)}
									</div>
								)
							)}

							{sensorReport.chartData &&
								Object.entries(sensorReport.chartData).map(
									([category, chartMetrics]) => (
										<div
											key={category}
											style={{ marginTop: "24px" }}>
											<h3
												style={{
													color: "#111827",
													marginBottom: "12px",
												}}>
												Gráficas -{" "}
												{category.toUpperCase()}
											</h3>
											{chartMetrics.map((chartMetric) => (
												<div key={chartMetric.metric}>
													<h4
														style={{
															color: "#374151",
															marginBottom: "8px",
														}}>
														{chartMetric.metric}
													</h4>
													<ChartContainer>
														<ResponsiveContainer
															width="100%"
															height="100%">
															<LineChart
																data={
																	chartMetric.data
																}>
																<CartesianGrid strokeDasharray="3 3" />
																<XAxis
																	dataKey="timestamp"
																	tickFormatter={(
																		value
																	) =>
																		new Date(
																			value
																		).toLocaleTimeString()
																	}
																/>
																<YAxis />
																<Tooltip
																	labelFormatter={(
																		value
																	) =>
																		new Date(
																			value
																		).toLocaleString()
																	}
																/>
																<Legend />
																<Line
																	type="monotone"
																	dataKey="value"
																	stroke="#2563eb"
																	name={
																		chartMetric.metric
																	}
																/>
															</LineChart>
														</ResponsiveContainer>
													</ChartContainer>
												</div>
											))}
										</div>
									)
								)}
						</Section>
					))}
				</ResultsContainer>
			)}
		</Container>
	);
}
