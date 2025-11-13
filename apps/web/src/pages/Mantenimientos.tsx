import type React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import {
	type Maintenance,
	type Sensor,
	type Technician,
	type Failure,
} from "../types";
import { api } from "../lib/api";
import * as XLSX from "xlsx";

// === Utilidades extra ===

// normaliza texto: sin acentos, minúsculas, trim
const normalize = (s: string) =>
	s
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();

// buscar por nombre flexible
const findByName = <T extends { name: string }>(
	items: T[],
	target: string | undefined | null,
) => {
	if (!target) return null;
	const t = normalize(String(target));
	return items.find((i) => normalize(i.name) === t) ?? null;
};

// parse fecha estilo "DD/MM/YYYY HH:mm" o "DD/MM/YYYY"
const parseHumanDate = (raw: string | undefined | null): Date | null => {
	if (!raw) return null;
	const [datePart, hourPart] = String(raw).split(" ");
	const [d, m, y] = datePart.split("/").map(Number);
	if (!d || !m || !y) return null;

	if (!hourPart) return new Date(y, m - 1, d);

	const [hh, mm] = hourPart.split(":").map(Number);
	return new Date(y, m - 1, d, hh ?? 0, mm ?? 0);
};

// === Estilos base ===
const Container = styled.div`
	padding: 0;
`;

const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24px;
`;

const Title = styled.h1`
	font-size: 30px;
	font-weight: bold;
	color: #111827;
	margin: 0;
`;

const Button = styled.button`
	padding: 10px 16px;
	background-color: #2563eb;
	color: white;
	border: none;
	border-radius: 8px;
	cursor: pointer;
	font-weight: 500;
	transition: background-color 0.2s, box-shadow 0.2s, transform 0.05s;
	box-shadow: 0 10px 15px -10px rgba(37, 99, 235, 0.7);

	&:hover {
		background-color: #1d4ed8;
		box-shadow: 0 10px 20px -10px rgba(37, 99, 235, 0.9);
	}

	&:active {
		transform: scale(0.98);
		box-shadow: 0 4px 10px -6px rgba(37, 99, 235, 0.9);
	}
`;

const ImportButton = styled(Button)`
	background-color: #059669;
	box-shadow: 0 10px 15px -10px rgba(5, 150, 105, 0.7);

	&:hover {
		background-color: #047857;
		box-shadow: 0 10px 20px -10px rgba(5, 150, 105, 0.9);
	}
`;

const MaintenanceList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const MaintenanceCard = styled.div`
	background: white;
	border-radius: 12px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
	padding: 20px;
	border: 1px solid #e5e7eb;
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const CardHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 4px;
`;

const SensorName = styled.h3`
	font-size: 18px;
	font-weight: 600;
	color: #111827;
	margin: 0;
`;

const EditButton = styled.button`
	padding: 6px 10px;
	font-size: 14px;
	background-color: #f3f4f6;
	border: none;
	border-radius: 999px;
	cursor: pointer;
	font-weight: 500;
	color: #374151;
	transition: background-color 0.2s, transform 0.05s;

	&:hover {
		background-color: #e5e7eb;
	}

	&:active {
		transform: scale(0.97);
	}
`;

const Description = styled.p`
	color: #374151;
	margin: 4px 0;
	font-size: 14px;
`;

const InfoList = styled.div`
	font-size: 13px;
	color: #6b7280;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	gap: 4px 16px;

	p {
		margin: 0;
		display: flex;
		align-items: center;
		gap: 4px;
	}
`;

const TagRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 4px;
`;

const Tag = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 3px 8px;
	border-radius: 999px;
	font-size: 11px;
	font-weight: 500;
	background-color: #f3f4f6;
	color: #374151;
`;

const TypeTag = styled(Tag)<{ $type: string }>`
	background-color: ${({ $type }) =>
		$type === "Correctivo"
			? "#fee2e2"
			: $type === "Predictivo"
			? "#e0f2fe"
			: "#dcfce7"};
	color: ${({ $type }) =>
		$type === "Correctivo"
			? "#b91c1c"
			: $type === "Predictivo"
			? "#0369a1"
			: "#15803d"};
`;

const FailureTag = styled(Tag)<{ $status?: string | null }>`
	background-color: ${({ $status }) =>
		$status === "resuelta"
			? "#dcfce7"
			: $status === "en reparación"
			? "#fef9c3"
			: "#fee2e2"};
	color: ${({ $status }) =>
		$status === "resuelta"
			? "#15803d"
			: $status === "en reparación"
			? "#92400e"
			: "#b91c1c"};
`;

const LoadingText = styled.div`
	text-align: center;
	padding: 48px 0;
	color: #6b7280;
`;

// === Modal base ===
const Modal = styled.div`
	position: fixed;
	inset: 0;
	background-color: rgba(15, 23, 42, 0.55);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px;
	z-index: 50;
`;

const ModalContent = styled.div`
	position: relative;
	background: white;
	border-radius: 12px;
	max-width: 520px;
	width: 100%;
	padding: 24px;
	box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
		0 10px 10px -5px rgba(0, 0, 0, 0.04);
	max-height: 90vh;
	overflow-y: auto;
`;

const CloseIconButton = styled.button`
	position: absolute;
	top: 12px;
	right: 12px;
	height: 36px;
	width: 36px;
	border-radius: 999px;
	border: 1px solid #e5e7eb;
	background: #f9fafb;
	color: #111827;
	cursor: pointer;
	font-size: 18px;
	line-height: 1;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.15s, border-color 0.15s, transform 0.05s;

	&:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
	}

	&:active {
		transform: scale(0.96);
	}
`;

const ModalTitle = styled.h2`
	font-size: 20px;
	font-weight: bold;
	margin: 0 0 16px 0;
	color: #111827;
`;

// === Botones form ===
const ButtonGroup = styled.div`
	display: flex;
	gap: 12px;
	padding-top: 16px;
`;

const BaseButton = styled.button`
	flex: 1;
	min-height: 40px;
	padding: 8px 16px;
	border-radius: 8px;
	font-weight: 600;
	cursor: pointer;
	transition: background-color 0.15s, border-color 0.15s, color 0.15s,
		transform 0.05s;
	display: inline-flex;
	align-items: center;
	justify-content: center;

	&:active {
		transform: scale(0.97);
	}
`;

const CancelButton = styled(BaseButton)`
	background: #f3f4f6;
	color: #111827;
	border: 1px solid #d1d5db;
	&:hover {
		background: #e5e7eb;
		border-color: #cfd4dc;
	}
`;

const SubmitButton = styled(BaseButton)`
	background-color: #2563eb;
	color: white;
	border: none;
	&:hover {
		background-color: #1d4ed8;
	}
`;

// === Campos de formulario ===
const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const Field = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
	font-size: 14px;
`;

const Label = styled.label`
	font-weight: 500;
	color: #374151;
`;

const TextInput = styled.input`
	width: 100%;
	min-height: 38px;
	border-radius: 8px;
	border: 1px solid #d1d5db;
	padding: 8px 10px;
	font-size: 14px;
	color: #111827;
	background-color: #f9fafb;
	transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;

	&:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 1px #2563eb33;
		background-color: white;
	}
`;

const NumberInput = styled(TextInput).attrs({ type: "number" })`
	text-align: right;
`;

const SelectInput = styled.select`
	width: 100%;
	min-height: 38px;
	border-radius: 8px;
	border: 1px solid #d1d5db;
	padding: 8px 10px;
	font-size: 14px;
	color: #111827;
	background-color: #f9fafb;
	transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;

	&:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 1px #2563eb33;
		background-color: white;
	}
`;

const TextArea = styled.textarea`
	width: 100%;
	min-height: 70px;
	max-height: 180px;
	border-radius: 8px;
	border: 1px solid #d1d5db;
	padding: 8px 10px;
	font-size: 14px;
	color: #111827;
	background-color: #f9fafb;
	resize: vertical;
	overflow-y: auto;
	transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;

	&:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 1px #2563eb33;
		background-color: white;
	}
`;

const ErrorText = styled.span`
	font-size: 12px;
	color: #b91c1c;
`;

// === Filtros ===
const FiltersBar = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-bottom: 16px;

	> * {
		flex: 1 1 150px;
		min-width: 150px;
	}
`;

// === utilidades ===
const formatMoney = (value?: number | null) => {
	if (value == null) return "";
	return value.toLocaleString("es-DO", {
		style: "currency",
		currency: "DOP",
		maximumFractionDigits: 2,
	});
};

const safeNumber = (value: string) => {
	const n = Number(value);
	if (Number.isNaN(n)) return undefined;
	return n;
};

// === Componente principal ===
export default function Mantenimientos() {
	const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
	const [sensors, setSensors] = useState<Sensor[]>([]);
	const [technicians, setTechnicians] = useState<Technician[]>([]);
	const [failures, setFailures] = useState<Failure[]>([]);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState<Maintenance | null>(null);
	const [showForm, setShowForm] = useState(false);

	const [showImport, setShowImport] = useState(false);
	const [importing, setImporting] = useState(false);
	const [importError, setImportError] = useState("");
	const [importSummary, setImportSummary] = useState<string | null>(null);

	// filtros
	const [filterSensorId, setFilterSensorId] = useState<string>("");
	const [filterTechnicianId, setFilterTechnicianId] = useState<string>("");
	const [filterType, setFilterType] = useState<string>("");
	const [filterHasFailures, setFilterHasFailures] = useState<string>("");
	const [filterText, setFilterText] = useState<string>("");

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const [maintenancesData, sensorsData, techData, failuresData] =
				await Promise.all([
					api.getMaintenances(),
					api.getSensors(),
					api.getTechnicians(),
					api.getFailures?.() ?? Promise.resolve([]),
				]);

			setMaintenances(maintenancesData);
			setSensors(sensorsData);
			setTechnicians(techData);
			setFailures(failuresData);
		} catch (error) {
			console.error("Error cargando datos:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (maintenance: Maintenance) => {
		setEditing(maintenance);
		setShowForm(true);
	};

	// === Importar desde Excel usando NOMBRES con reporte detallado ===
	const handleImportExcel = async (file: File) => {
		setImportError("");
		setImportSummary(null);
		setImporting(true);

		try {
			const buffer = await file.arrayBuffer();
			const workbook = XLSX.read(buffer, { type: "array" });
			const sheet = workbook.Sheets[workbook.SheetNames[0]];

			const rows = XLSX.utils.sheet_to_json(sheet) as any[];

			const report: {
				rowIndex: number;
				row: any;
				status: "ok" | "skipped";
				reason?: string;
			}[] = [];

			for (let index = 0; index < rows.length; index++) {
				const row = rows[index];

				try {
					const sensorName = row.sensor || row.sensorName;
					const type = row.type as Maintenance["type"];
					const technicianName = row.technician || row.technicianName;
					const notes = row.notes || undefined;
					const durationMinutes =
						row.durationMinutes != null
							? Number(row.durationMinutes)
							: undefined;
					const cost =
						row.cost != null ? Number(row.cost) : undefined;
					const performedAtRaw = row.performedAt;

					const sensor = findByName(sensors, sensorName);
					if (!sensor) {
						report.push({
							rowIndex: index + 1,
							row,
							status: "skipped",
							reason: "Sensor no encontrado",
						});
						continue;
					}

					const technician = technicianName
						? findByName(technicians, technicianName)
						: null;

					if (!type) {
						report.push({
							rowIndex: index + 1,
							row,
							status: "skipped",
							reason: "Tipo de mantenimiento vacío o inválido",
						});
						continue;
					}

					if (durationMinutes != null && durationMinutes < 0) {
						report.push({
							rowIndex: index + 1,
							row,
							status: "skipped",
							reason: "Duración negativa",
						});
						continue;
					}

					if (cost != null && cost < 0) {
						report.push({
							rowIndex: index + 1,
							row,
							status: "skipped",
							reason: "Costo negativo",
						});
						continue;
					}

					const parsedDate =
						parseHumanDate(performedAtRaw) || new Date();

					const payload = {
						sensorId: sensor.id,
						type,
						technicianId: technician?.id,
						notes,
						performedAt: parsedDate.toISOString(),
						durationMinutes,
						cost,
					};

					await api.createMaintenance(payload);

					report.push({
						rowIndex: index + 1,
						row,
						status: "ok",
					});
				} catch (err) {
					console.log(
						"Error creando mantenimiento para fila:",
						row,
						err,
					);
					report.push({
						rowIndex: index + 1,
						row,
						status: "skipped",
						reason: "Error en la creación del mantenimiento",
					});
				}
			}

			await loadData();

			const ok = report.filter((r) => r.status === "ok").length;
			const skipped = report.filter((r) => r.status === "skipped").length;

			const details = report
				.map((r) =>
					r.status === "ok"
						? `✔️ Fila ${r.rowIndex}: importada correctamente (${JSON.stringify(
								r.row,
						  )})`
						: `❌ Fila ${r.rowIndex}: ignorada (${r.reason}) → ${JSON.stringify(
								r.row,
						  )}`,
				)
				.join("\n");

			setImportSummary(
				`Importación completada:
${ok} filas procesadas correctamente,
${skipped} filas ignoradas por datos inválidos.

Detalles:
${details}`,
			);
			setShowImport(false);
		} catch (err) {
			console.error("Error importando:", err);
			setImportError("El archivo no tiene el formato esperado.");
		} finally {
			setImporting(false);
		}
	};

	// === Filtrado ===
	const filteredMaintenances = maintenances.filter((m) => {
		// Ahora consideramos fallas tanto por maintenanceId como por sensorId
		const relatedFailures = failures.filter(
			(f) =>
				(f as any).maintenanceId === m.id ||
				(f as any).sensorId === m.sensorId,
		);

		const sensor = sensors.find((s) => s.id === m.sensorId);
		const tech =
			m.technician ??
			technicians.find((t) => t.id === m.technicianId);

		if (filterSensorId && m.sensorId.toString() !== filterSensorId)
			return false;

		if (
			filterTechnicianId &&
			m.technicianId?.toString() !== filterTechnicianId
		)
			return false;

		if (filterType && m.type !== filterType) return false;

		if (filterHasFailures === "yes" && relatedFailures.length === 0)
			return false;

		if (filterHasFailures === "no" && relatedFailures.length > 0)
			return false;

		if (filterText) {
			const text = normalize(filterText);
			const haystack =
				normalize(sensor?.name || "") +
				" " +
				normalize(tech?.name || "") +
				" " +
				normalize(m.notes || "") +
				" " +
				normalize(m.type || "");
			if (!haystack.includes(text)) return false;
		}

		return true;
	});

	if (loading) return <LoadingText>Cargando mantenimientos...</LoadingText>;

	return (
		<Container>
			<Header>
				<Title>Mantenimientos</Title>
				<div style={{ display: "flex", gap: "12px" }}>
					<ImportButton onClick={() => setShowImport(true)}>
						Importar desde Excel
					</ImportButton>
					<Button
						onClick={() => {
							setEditing(null);
							setShowForm(true);
						}}>
						+ Nuevo Mantenimiento
					</Button>
				</div>
			</Header>

			{importSummary && (
				<p
					style={{
						fontSize: 13,
						color: "#4b5563",
						marginBottom: 12,
						whiteSpace: "pre-wrap",
					}}>
					{importSummary}
				</p>
			)}

			{/* Filtros bonitos */}
			<FiltersBar>
				<SelectInput
					value={filterSensorId}
					onChange={(e) => setFilterSensorId(e.target.value)}>
					<option value="">Todos los sensores</option>
					{sensors.map((s) => (
						<option key={s.id} value={s.id}>
							{s.name}
						</option>
					))}
				</SelectInput>

				<SelectInput
					value={filterTechnicianId}
					onChange={(e) => setFilterTechnicianId(e.target.value)}>
					<option value="">Todos los técnicos</option>
					{technicians.map((t) => (
						<option key={t.id} value={t.id}>
							{t.name}
						</option>
					))}
				</SelectInput>

				<SelectInput
					value={filterType}
					onChange={(e) => setFilterType(e.target.value)}>
					<option value="">Todos los tipos</option>
					<option value="Preventivo">Preventivo</option>
					<option value="Correctivo">Correctivo</option>
					<option value="Predictivo">Predictivo</option>
				</SelectInput>

				<SelectInput
					value={filterHasFailures}
					onChange={(e) => setFilterHasFailures(e.target.value)}>
					<option value="">Con / sin fallas</option>
					<option value="yes">Con fallas</option>
					<option value="no">Sin fallas</option>
				</SelectInput>

				<TextInput
					placeholder="Buscar por texto (sensor, técnico, notas...)"
					value={filterText}
					onChange={(e) => setFilterText(e.target.value)}
				/>
			</FiltersBar>

			<MaintenanceList>
				{filteredMaintenances.map((m) => {
					const sensor = sensors.find((s) => s.id === m.sensorId);
					const tech =
						m.technician ??
						technicians.find((t) => t.id === m.technicianId);
					const relatedFailures = failures.filter(
						(f) =>
							(f as any).maintenanceId === m.id ||
							(f as any).sensorId === m.sensorId,
					);

					return (
						<MaintenanceCard key={m.id}>
							<CardHeader>
								<SensorName>
									{sensor?.name || `Sensor ${m.sensorId}`}
								</SensorName>
								<EditButton onClick={() => handleEdit(m)}>
									Editar
								</EditButton>
							</CardHeader>

							<TagRow>
								<TypeTag $type={m.type}>Tipo: {m.type}</TypeTag>
								{tech && <Tag>👤 {tech.name}</Tag>}
								{m.durationMinutes != null && (
									<Tag>⏱ {m.durationMinutes} min</Tag>
								)}
								{m.cost != null && (
									<Tag>💰 {formatMoney(m.cost)}</Tag>
								)}
							</TagRow>

							<Description>
								📅 Realizado:{" "}
								{new Date(m.performedAt).toLocaleString()}
							</Description>

							<InfoList>
								{m.notes && (
									<p>
										<span>📝 Notas:</span>
										<span>{m.notes}</span>
									</p>
								)}

								{relatedFailures.length > 0 && (
									<p>
										<span>⚠️ Fallas:</span>
										<span>
											{relatedFailures.length} registrada
											{relatedFailures.length > 1 && "s"}
										</span>
									</p>
								)}
							</InfoList>

							{relatedFailures.length > 0 && (
								<div
									style={{
										marginTop: 8,
										borderTop: "1px dashed #e5e7eb",
										paddingTop: 6,
									}}>
									<div
										style={{
											fontSize: 12,
											color: "#6b7280",
											marginBottom: 4,
										}}>
										Detalle de fallas
									</div>
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											gap: 4,
										}}>
										{relatedFailures.map((f) => (
											<div
												key={f.id}
												style={{
													display: "flex",
													flexWrap: "wrap",
													gap: 6,
													alignItems: "center",
													fontSize: 12,
													color: "#4b5563",
												}}>
												<FailureTag $status={f.status}>
													{f.status || "sin estado"}
												</FailureTag>
												{f.severity && (
													<Tag>{f.severity}</Tag>
												)}
												<span>
													{f.description} —{" "}
													{new Date(
														f.occurredAt,
													).toLocaleDateString()}
												</span>
												{f.resolvedAt && (
													<span
														style={{
															color: "#16a34a",
														}}>
														(Resuelta el{" "}
														{new Date(
															f.resolvedAt,
														).toLocaleDateString()}
														)
													</span>
												)}
											</div>
										))}
									</div>
								</div>
							)}
						</MaintenanceCard>
					);
				})}
			</MaintenanceList>

			{showForm && (
				<MaintenanceForm
					sensors={sensors}
					technicians={technicians}
					initialData={editing}
					onClose={() => {
						setShowForm(false);
						setEditing(null);
					}}
					onSave={() => {
						loadData();
						setShowForm(false);
						setEditing(null);
					}}
				/>
			)}

			{showImport && (
				<Modal onClick={() => setShowImport(false)}>
					<ModalContent onClick={(e) => e.stopPropagation()}>
						<CloseIconButton
							aria-label="Cerrar"
							onClick={() => setShowImport(false)}>
							×
						</CloseIconButton>
						<ModalTitle>Importar Mantenimientos</ModalTitle>

						<Field>
							<Label>Archivo Excel</Label>
							<TextInput
								as="input"
								type="file"
								accept=".xlsx,.xls"
								onChange={(
									e: React.ChangeEvent<HTMLInputElement>,
								) => {
									const file = e.target.files?.[0];
									if (file) handleImportExcel(file);
								}}
							/>
							<small style={{ fontSize: 11, color: "#6b7280" }}>
								Columnas esperadas:{" "}
								<strong>
									sensor, type, technician, performedAt
									(DD/MM/YYYY HH:mm), durationMinutes, cost,
									notes
								</strong>
							</small>
						</Field>

						{importing && <p>Procesando archivo...</p>}
						{importError && <ErrorText>{importError}</ErrorText>}
					</ModalContent>
				</Modal>
			)}
		</Container>
	);
}

function MaintenanceForm({
	sensors,
	technicians,
	initialData,
	onClose,
	onSave,
}: {
	sensors: Sensor[];
	technicians: Technician[];
	initialData?: Maintenance | null;
	onClose: () => void;
	onSave: () => void;
}) {
	const [formData, setFormData] = useState({
		sensorId: initialData?.sensorId?.toString() || "",
		type: initialData?.type || "Preventivo",
		technicianId: initialData?.technicianId?.toString() || "",
		performedAt: initialData
			? new Date(initialData.performedAt).toISOString().slice(0, 16)
			: "",
		durationMinutes:
			initialData?.durationMinutes != null
				? initialData.durationMinutes.toString()
				: "",
		cost: initialData?.cost != null ? initialData.cost.toString() : "",
		notes: initialData?.notes || "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.sensorId) {
			newErrors.sensorId = "Selecciona un sensor.";
		}

		if (!formData.type) {
			newErrors.type = "Selecciona un tipo de mantenimiento.";
		}

		if (formData.durationMinutes) {
			const n = safeNumber(formData.durationMinutes) ?? -1;
			if (n < 0) {
				newErrors.durationMinutes =
					"La duración no puede ser negativa.";
			}
		}

		if (formData.cost) {
			const n = safeNumber(formData.cost) ?? -1;
			if (n < 0) {
				newErrors.cost = "El costo no puede ser negativo.";
			}
		}

		if (formData.performedAt) {
			const d = new Date(formData.performedAt);
			if (Number.isNaN(d.getTime())) {
				newErrors.performedAt = "Fecha/hora inválida.";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		try {
			const payload = {
				sensorId: Number(formData.sensorId),
				type: formData.type as Maintenance["type"],
				technicianId: formData.technicianId
					? Number(formData.technicianId)
					: undefined,
				notes: formData.notes || undefined,
				cost: formData.cost ? Number(formData.cost) : undefined,
				durationMinutes: formData.durationMinutes
					? Number(formData.durationMinutes)
					: undefined,
				performedAt: formData.performedAt
					? new Date(formData.performedAt).toISOString()
					: new Date().toISOString(),
			};

			if (initialData) {
				await api.updateMaintenance(initialData.id.toString(), payload);
			} else {
				await api.createMaintenance(payload);
			}

			onSave();
		} catch (error) {
			console.error("Error guardando mantenimiento:", error);
		}
	};

	const handleFieldChange =
		(field: keyof typeof formData) =>
		(
			e:
				| React.ChangeEvent<HTMLInputElement>
				| React.ChangeEvent<HTMLSelectElement>
				| React.ChangeEvent<HTMLTextAreaElement>,
		) => {
			setFormData((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
			if (errors[field]) {
				setErrors((prev) => {
					const clone = { ...prev };
					delete clone[field];
					return clone;
				});
			}
		};

	return (
		<Modal onClick={onClose}>
			<ModalContent onClick={(e) => e.stopPropagation()}>
				<CloseIconButton aria-label="Cerrar" onClick={onClose}>
					×
				</CloseIconButton>

				<ModalTitle>
					{initialData
						? "Editar Mantenimiento"
						: "Nuevo Mantenimiento"}
				</ModalTitle>

				<Form onSubmit={handleSubmit}>
					<Field>
						<Label>Sensor</Label>
						<SelectInput
							required
							value={formData.sensorId}
							onChange={handleFieldChange("sensorId")}>
							<option value="">Seleccionar sensor</option>
							{sensors.map((s) => (
								<option key={s.id} value={s.id}>
									{s.name}
								</option>
							))}
						</SelectInput>
						{errors.sensorId && (
							<ErrorText>{errors.sensorId}</ErrorText>
						)}
					</Field>

					<Field>
						<Label>Tipo de mantenimiento</Label>
						<SelectInput
							value={formData.type}
							onChange={handleFieldChange("type")}>
							<option value="Preventivo">Preventivo</option>
							<option value="Correctivo">Correctivo</option>
							<option value="Predictivo">Predictivo</option>
						</SelectInput>
						{errors.type && <ErrorText>{errors.type}</ErrorText>}
					</Field>

					<Field>
						<Label>Técnico</Label>
						<SelectInput
							value={formData.technicianId}
							onChange={handleFieldChange("technicianId")}>
							<option value="">Sin asignar</option>
							{technicians.map((t) => (
								<option key={t.id} value={t.id}>
									{t.name}
								</option>
							))}
						</SelectInput>
					</Field>

					<Field>
						<Label>Fecha y hora de realización</Label>
						<TextInput
							type="datetime-local"
							value={formData.performedAt}
							onChange={handleFieldChange("performedAt")}
						/>
						{errors.performedAt && (
							<ErrorText>{errors.performedAt}</ErrorText>
						)}
					</Field>

					<Field>
						<Label>Duración (minutos)</Label>
						<NumberInput
							min={0}
							value={formData.durationMinutes}
							onChange={handleFieldChange("durationMinutes")}
						/>
						{errors.durationMinutes && (
							<ErrorText>{errors.durationMinutes}</ErrorText>
						)}
					</Field>

					<Field>
						<Label>Costo</Label>
						<NumberInput
							min={0}
							step="0.01"
							value={formData.cost}
							onChange={handleFieldChange("cost")}
						/>
						{errors.cost && <ErrorText>{errors.cost}</ErrorText>}
					</Field>

					<Field>
						<Label>Notas</Label>
						<TextArea
							rows={3}
							value={formData.notes}
							onChange={handleFieldChange("notes")}
						/>
					</Field>

					<ButtonGroup>
						<CancelButton
							type="button"
							onClick={(e) => {
								e.preventDefault();
								onClose();
							}}>
							Cancelar
						</CancelButton>
						<SubmitButton type="submit">
							{initialData ? "Guardar cambios" : "Crear"}
						</SubmitButton>
					</ButtonGroup>
				</Form>
			</ModalContent>
		</Modal>
	);
}
